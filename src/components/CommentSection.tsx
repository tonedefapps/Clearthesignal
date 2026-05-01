'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getComments, addComment, softDeleteComment, type Comment } from '@/lib/firebase/comments'

function formatDate(ts: { seconds: number } | null) {
  if (!ts) return ''
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface ReplyProps {
  reply: Comment
  postId: string
  parentCollection: string
  isAdmin: boolean
  onRefresh: () => void
}

function Reply({ reply, postId, parentCollection, isAdmin, onRefresh }: ReplyProps) {
  async function handleDelete() {
    await softDeleteComment(postId, reply.id, parentCollection)
    onRefresh()
  }

  if (reply.deleted) {
    return <p className="py-2 text-sand/25 text-xs italic">[removed]</p>
  }

  return (
    <div className="py-3 border-b border-periwinkle/8 last:border-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-periwinkle-light">{reply.displayName}</span>
          <span className="text-xs text-sand/30">{formatDate(reply.createdAt)}</span>
        </div>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="text-xs text-red-rock/50 hover:text-red-rock transition-colors"
          >
            delete
          </button>
        )}
      </div>
      <p className="text-sm text-white/80 leading-relaxed">{reply.body}</p>
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  postId: string
  parentCollection: string
  isAdmin: boolean
  replies: Comment[]
  onRefresh: () => void
}

function CommentItem({ comment, postId, parentCollection, isAdmin, replies, onRefresh }: CommentItemProps) {
  const { user, profile } = useAuth()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleDelete() {
    await softDeleteComment(postId, comment.id, parentCollection)
    onRefresh()
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile || !replyBody.trim()) return
    setSubmitting(true)
    try {
      await addComment(postId, {
        uid: user.uid,
        displayName: profile.displayName || user.email || 'anonymous',
        body: replyBody.trim(),
        parentId: comment.id,
      }, parentCollection)
      setReplyBody('')
      setReplyOpen(false)
      onRefresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-b border-periwinkle/10 last:border-0">
      <div className="py-4">
        {comment.deleted ? (
          <p className="text-sand/25 text-xs italic">[removed]</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-periwinkle-light">{comment.displayName}</span>
                <span className="text-xs text-sand/30">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <button
                    onClick={() => setReplyOpen(o => !o)}
                    className="text-xs text-sand/35 hover:text-sand/60 transition-colors"
                  >
                    reply
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    className="text-xs text-red-rock/50 hover:text-red-rock transition-colors"
                  >
                    delete
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{comment.body}</p>
          </>
        )}
      </div>

      {/* nested replies */}
      {replies.length > 0 && (
        <div className="ml-5 pl-4 border-l border-periwinkle/15 mb-2">
          {replies.map(reply => (
            <Reply
              key={reply.id}
              reply={reply}
              postId={postId}
              parentCollection={parentCollection}
              isAdmin={isAdmin}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* inline reply form */}
      {replyOpen && user && (
        <form onSubmit={handleReply} className="ml-5 mb-4 flex flex-col gap-2">
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder="add a reply..."
            rows={2}
            className="w-full bg-mesa border border-periwinkle/20 rounded-lg px-3 py-2 text-sm text-white placeholder-sand/30 focus:outline-none focus:border-periwinkle/50 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting || !replyBody.trim()}
              className="text-xs px-3 py-1.5 bg-periwinkle hover:bg-periwinkle-light disabled:opacity-40 rounded-lg text-white transition-colors"
            >
              {submitting ? 'posting...' : 'post reply'}
            </button>
            <button
              type="button"
              onClick={() => { setReplyOpen(false); setReplyBody('') }}
              className="text-xs text-sand/40 hover:text-sand/70 transition-colors"
            >
              cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function CommentSection({ postId, parentCollection = 'signal_posts' }: { postId: string; parentCollection?: string }) {
  const { user, profile, loading } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = profile?.role === 'admin' || profile?.role === 'mod'

  const loadComments = useCallback(async () => {
    const data = await getComments(postId, parentCollection)
    setComments(data)
    setLoadingComments(false)
  }, [postId, parentCollection])

  useEffect(() => { loadComments() }, [loadComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile || !body.trim()) return
    setSubmitting(true)
    try {
      await addComment(postId, {
        uid: user.uid,
        displayName: profile.displayName || user.email || 'anonymous',
        body: body.trim(),
        parentId: null,
      }, parentCollection)
      setBody('')
      await loadComments()
    } finally {
      setSubmitting(false)
    }
  }

  const topLevel = comments.filter(c => c.parentId === null)
  const repliesByParent = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parentId) {
      if (!acc[c.parentId]) acc[c.parentId] = []
      acc[c.parentId].push(c)
    }
    return acc
  }, {})

  const visibleCount = comments.filter(c => !c.deleted).length

  return (
    <section>
      <h2 className="text-xs font-medium text-periwinkle-light tracking-widest uppercase mb-6 flex items-center gap-2">
        discussion
        {visibleCount > 0 && (
          <span className="text-sand/40 font-normal normal-case text-xs">({visibleCount})</span>
        )}
      </h2>

      {/* comment form */}
      {!loading && (
        user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="add to the signal..."
              rows={3}
              className="w-full bg-mesa border border-periwinkle/20 rounded-xl px-4 py-3 text-sm text-white placeholder-sand/30 focus:outline-none focus:border-periwinkle/50 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-sand/30">{profile?.displayName || user.email}</span>
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="text-sm px-4 py-1.5 bg-periwinkle hover:bg-periwinkle-light disabled:opacity-40 rounded-lg text-white transition-colors"
              >
                {submitting ? 'posting...' : 'post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 py-5 text-center border border-periwinkle/15 rounded-xl">
            <p className="text-sand/40 text-sm">
              <Link href="/auth" className="text-periwinkle-light hover:text-desert-sky transition-colors">
                sign in
              </Link>
              {' '}to join the discussion
            </p>
          </div>
        )
      )}

      {/* thread */}
      {loadingComments ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-mesa-light/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-sand/30 text-sm text-center py-8">no comments yet. be the first.</p>
      ) : (
        <div>
          {topLevel.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              parentCollection={parentCollection}
              isAdmin={isAdmin}
              replies={repliesByParent[comment.id] || []}
              onRefresh={loadComments}
            />
          ))}
        </div>
      )}
    </section>
  )
}
