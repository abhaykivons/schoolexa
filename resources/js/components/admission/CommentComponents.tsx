// Shared Comment Components for Admission Forms
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Comment interface
export interface Comment {
    id: number;
    field_name: string | null;
    comment: string;
    reply: string | null;
    reply_by_name: string | null;
    reply_at: string | null;
    is_resolved: boolean;
    resolved_at: string | null;
    user_name: string;
    created_at: string;
}

// Props for CommentItem component
interface CommentItemProps {
    comment: Comment;
    onReply: (commentId: number, replyText: string) => void;
    onResolve: (commentId: number) => void;
    isSubmitting: boolean;
}

// Field Comment Item component - for comments on specific fields
export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onResolve, isSubmitting }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [localReplyText, setLocalReplyText] = useState('');

    const handleSubmitReply = () => {
        if (!localReplyText.trim()) return;
        onReply(comment.id, localReplyText);
        setLocalReplyText('');
        setIsReplying(false);
    };

    const isResolved = comment.is_resolved || comment.reply;

    return (
        <div className={`p-3 rounded-md border ${isResolved ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">{comment.user_name}</span>
                        <span className="text-xs text-muted-foreground">{comment.created_at}</span>
                        {isResolved && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {comment.is_resolved ? 'Resolved' : 'Responded'}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{comment.comment}</p>
                    
                    {/* Show existing reply */}
                    {comment.reply && (
                        <div className="ml-6 mt-2 p-2 bg-white rounded border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-green-700">Your Reply:</span>
                                <span className="text-xs text-muted-foreground">{comment.reply_at}</span>
                            </div>
                            <p className="text-sm">{comment.reply}</p>
                        </div>
                    )}

                    {/* Reply form */}
                    {!comment.reply && !comment.is_resolved && isReplying && (
                        <div className="ml-6 mt-2 space-y-2">
                            <Textarea
                                placeholder="Type your reply..."
                                value={localReplyText}
                                onChange={(e) => setLocalReplyText(e.target.value)}
                                className="min-h-16"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSubmitReply}
                                    disabled={!localReplyText.trim() || isSubmitting}
                                >
                                    <Send className="h-3 w-3 mr-1" />
                                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setIsReplying(false); setLocalReplyText(''); }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {!comment.reply && !comment.is_resolved && !isReplying && (
                        <div className="ml-6 mt-2 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsReplying(true)}
                            >
                                <Send className="h-3 w-3 mr-1" />
                                Reply
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onResolve(comment.id)}
                                disabled={isSubmitting}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Resolved
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Global Comment Item component - for general form comments
export const GlobalCommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onResolve, isSubmitting }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [localReplyText, setLocalReplyText] = useState('');

    const handleSubmitReply = () => {
        if (!localReplyText.trim()) return;
        onReply(comment.id, localReplyText);
        setLocalReplyText('');
        setIsReplying(false);
    };

    const isResolved = comment.is_resolved || comment.reply;

    return (
        <div className={`p-3 rounded-md border ${isResolved ? 'bg-green-50 border-green-200' : 'bg-white border-blue-200'}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user_name}</span>
                        <span className="text-xs text-muted-foreground">{comment.created_at}</span>
                        {isResolved && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {comment.is_resolved ? 'Resolved' : 'Responded'}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                    
                    {/* Show existing reply */}
                    {comment.reply && (
                        <div className="mt-2 p-2 bg-white rounded border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-green-700">Your Reply:</span>
                                <span className="text-xs text-muted-foreground">{comment.reply_at}</span>
                            </div>
                            <p className="text-sm">{comment.reply}</p>
                        </div>
                    )}

                    {/* Reply form */}
                    {!comment.reply && !comment.is_resolved && isReplying && (
                        <div className="mt-2 space-y-2">
                            <Textarea
                                placeholder="Type your reply..."
                                value={localReplyText}
                                onChange={(e) => setLocalReplyText(e.target.value)}
                                className="min-h-16"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSubmitReply}
                                    disabled={!localReplyText.trim() || isSubmitting}
                                >
                                    <Send className="h-3 w-3 mr-1" />
                                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setIsReplying(false); setLocalReplyText(''); }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {!comment.reply && !comment.is_resolved && !isReplying && (
                        <div className="mt-2 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsReplying(true)}
                            >
                                <Send className="h-3 w-3 mr-1" />
                                Reply
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onResolve(comment.id)}
                                disabled={isSubmitting}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Resolved
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Global Comments Section component
interface GlobalCommentsSectionProps {
    comments: Comment[];
    onReply: (commentId: number, replyText: string) => void;
    onResolve: (commentId: number) => void;
    isSubmitting: boolean;
}

export const GlobalCommentsSection: React.FC<GlobalCommentsSectionProps> = ({ 
    comments, 
    onReply, 
    onResolve, 
    isSubmitting 
}) => {
    if (!comments || comments.length === 0) return null;

    return (
        <Card className="shadow-none border bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    School Comments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {comments.map((comment: Comment) => (
                    <GlobalCommentItem 
                        key={comment.id} 
                        comment={comment} 
                        onReply={onReply}
                        onResolve={onResolve}
                        isSubmitting={isSubmitting}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

// Field Comments List component
interface FieldCommentsListProps {
    comments: Comment[];
    onReply: (commentId: number, replyText: string) => void;
    onResolve: (commentId: number) => void;
    isSubmitting: boolean;
}

export const FieldCommentsList: React.FC<FieldCommentsListProps> = ({ 
    comments, 
    onReply, 
    onResolve, 
    isSubmitting 
}) => {
    if (!comments || comments.length === 0) return null;

    return (
        <div className="mt-3 space-y-2">
            {comments.map((comment: Comment) => (
                <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onReply={onReply}
                    onResolve={onResolve}
                    isSubmitting={isSubmitting}
                />
            ))}
        </div>
    );
};

// Custom hook for comment handling
export const useCommentHandlers = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = (commentId: number, replyText: string) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);

        router.post(route('parent.comment.reply', commentId), {
            reply: replyText,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reply sent successfully');
                setIsSubmitting(false);
            },
            onError: () => {
                toast.error('Failed to send reply');
                setIsSubmitting(false);
            }
        });
    };

    const handleResolve = (commentId: number) => {
        setIsSubmitting(true);

        router.post(route('parent.comment.resolve', commentId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Comment marked as resolved');
                setIsSubmitting(false);
            },
            onError: () => {
                toast.error('Failed to resolve comment');
                setIsSubmitting(false);
            }
        });
    };

    return { isSubmitting, setIsSubmitting, handleReply, handleResolve };
};

// Helper to check for unresolved comments
export const hasUnresolvedComments = (
    commentsByField: Record<string, Comment[]> = {}, 
    globalComments: Comment[] = []
): boolean => {
    const allComments = [...(globalComments || [])];
    Object.values(commentsByField || {}).forEach((comments: Comment[]) => {
        allComments.push(...comments);
    });
    return allComments.some((c: Comment) => !c.is_resolved && !c.reply);
};

// Helper to get field comments
export const getFieldComments = (
    commentsByField: Record<string, Comment[]>, 
    fieldName: string
): Comment[] => {
    return commentsByField?.[fieldName] || [];
};

