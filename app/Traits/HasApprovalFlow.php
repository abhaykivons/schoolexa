<?php

namespace App\Traits;

use App\Models\ApprovalFlow;
use App\Models\ApprovalHistory;

trait HasApprovalFlow
{
    public function approvalFlows()
    {
        return $this->morphMany(ApprovalFlow::class, 'module', 'module_type', 'module_id');
    }

    public function approvalHistories()
    {
        return $this->morphMany(ApprovalHistory::class, 'module', 'module_type', 'module_id');
    }

    public function currentApprovalStatus()
    {
        return $this->approvalHistories()->latest()->first();
    }

    public function getCurrentApprover()
    {
        $lastApproval = $this->currentApprovalStatus();
        
        if (!$lastApproval || $lastApproval->status === 'rejected') {
            return null;
        }

        if ($lastApproval->status === 'pending') {
            return $lastApproval->approvalFlow;
        }

        $nextOrder = $lastApproval->approvalFlow->order + 1;
        return ApprovalFlow::where('module_type', $this->getMorphClass())
            ->where('order', $nextOrder)
            ->where('is_active', true)
            ->first();
    }

    public function recordApproval($status, $userId, $comments = null)
    {
        $currentApprover = $this->getCurrentApprover();
        
        if (!$currentApprover) {
            return false;
        }

        return $this->approvalHistories()->create([
            'approval_flow_id' => $currentApprover->id,
            'user_id' => $userId,
            'status' => $status,
            'comments' => $comments,
            'data_snapshot' => $this->toJson()
        ]);
    }
}