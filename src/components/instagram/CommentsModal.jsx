import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/appStore';
import { db } from '../../db/database';
import { X, Send, Trash2, Heart } from 'lucide-react';
import haptics from '../../utils/haptics';

export default function CommentsModal({ isOpen, onClose, postId, postTitle }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!postId) return;
    try {
      const items = await db.comments.where('postId').equals(postId).reverse().toArray();
      setComments(items);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    haptics.tap();
    setLoading(true);
    try {
      await db.comments.add({
        postId,
        username: isRtl ? 'کاربر_مدیر' : 'admin_user',
        userAvatar: 'https://i.pravatar.cc/150?img=60',
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      });
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    haptics.tap();
    try {
      await db.comments.delete(id);
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md bg-[var(--bg-card)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] max-h-[85vh] h-[70vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              {isRtl ? 'نظرات' : 'Comments'}
            </h3>
            {postTitle && (
              <span className="text-xs text-[var(--text-secondary)] font-normal truncate max-w-[180px]">
                ({postTitle})
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm py-12">
              <span className="text-3xl mb-2">💬</span>
              <p>{isRtl ? 'هنوز نظری ثبت نشده است. اولین نظر را بنویسید!' : 'No comments yet. Be the first to comment!'}</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--border)] mt-0.5">
                    <img src={comment.userAvatar || 'https://i.pravatar.cc/150?img=33'} alt={comment.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--text-primary)]">{comment.username}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] mt-1 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 p-1 transition-opacity"
                  title={isRtl ? 'حذف نظر' : 'Delete comment'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAddComment} className="p-3 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
          <input 
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isRtl ? 'نوشتن نظر برای این بخش...' : 'Add a comment...'}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-purple-500"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || loading}
            className="p-2 rounded-full bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95 shrink-0"
          >
            <Send size={16} className={isRtl ? 'rotate-180' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
