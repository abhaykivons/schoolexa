<?php

namespace App\Helpers;

use setasign\Fpdi\Fpdi;

/**
 * Custom PDF class with watermark support
 * Extends FPDI with rotation and alpha transparency
 */
class WatermarkedPdf extends Fpdi
{
    /**
     * Current rotation angle
     */
    protected $angle = 0;

    /**
     * Rotation method
     */
    public function Rotate($angle, $x = -1, $y = -1)
    {
        if ($x == -1) {
            $x = $this->x;
        }
        if ($y == -1) {
            $y = $this->y;
        }
        
        if ($this->angle != 0) {
            $this->_out('Q');
        }
        
        $this->angle = $angle;
        
        if ($angle != 0) {
            $angle *= M_PI / 180;
            $c = cos($angle);
            $s = sin($angle);
            $cx = $x * $this->k;
            $cy = ($this->h - $y) * $this->k;
            $this->_out(sprintf(
                'q %.5F %.5F %.5F %.5F %.2F %.2F cm 1 0 0 1 %.2F %.2F cm',
                $c, $s, -$s, $c, $cx, $cy, -$cx, -$cy
            ));
        }
    }

    /**
     * Override _endpage to reset rotation
     */
    public function _endpage()
    {
        if ($this->angle != 0) {
            $this->angle = 0;
            $this->_out('Q');
        }
        parent::_endpage();
    }

    /**
     * Set alpha/transparency
     * 
     * @param float $alpha Value from 0 (transparent) to 1 (opaque)
     * @param string $bm Blend mode
     */
    public function SetAlpha($alpha, $bm = 'Normal')
    {
        // Set alpha for drawing and text
        $gs = $this->AddExtGState(['ca' => $alpha, 'CA' => $alpha, 'BM' => '/' . $bm]);
        $this->SetExtGState($gs);
    }

    /**
     * Extended graphics state collection
     */
    protected $extgstates = [];

    /**
     * Add an extended graphics state
     */
    protected function AddExtGState($parms)
    {
        $n = count($this->extgstates) + 1;
        $this->extgstates[$n] = ['parms' => $parms];
        return $n;
    }

    /**
     * Set the extended graphics state
     */
    protected function SetExtGState($gs)
    {
        $this->_out(sprintf('/GS%d gs', $gs));
    }

    /**
     * Output extended graphics states
     */
    protected function _putextgstates()
    {
        for ($i = 1; $i <= count($this->extgstates); $i++) {
            $this->_newobj();
            $this->extgstates[$i]['n'] = $this->n;
            $this->_put('<</Type /ExtGState');
            $parms = $this->extgstates[$i]['parms'];
            $this->_put(sprintf('/ca %.3F', $parms['ca']));
            $this->_put(sprintf('/CA %.3F', $parms['CA']));
            $this->_put('/BM ' . $parms['BM']);
            $this->_put('>>');
            $this->_put('endobj');
        }
    }

    /**
     * Override _putresources to include ext graphics states
     */
    protected function _putresources()
    {
        $this->_putextgstates();
        parent::_putresources();
    }

    /**
     * Override _putresourcedict to include ext graphics states dict
     */
    protected function _putresourcedict()
    {
        parent::_putresourcedict();
        
        if (!empty($this->extgstates)) {
            $this->_put('/ExtGState <<');
            foreach ($this->extgstates as $k => $extgstate) {
                $this->_put('/GS' . $k . ' ' . $extgstate['n'] . ' 0 R');
            }
            $this->_put('>>');
        }
    }
}

