// src/components/TaskEditForm.jsx
import React, { useState } from 'react'
import TextField from '~/components/ui/TextField.jsx'
import Button from './ui/Button'
import './TaskCreateForm.css' // スタイルを再利用

/**
 * Props:
 * - task: task object (id, title, detail, done, limit?)
 * - onSave: async function(payload) | function(payload)
 *           should resolve on success so parent can close modal
 * - onCancel: function()  -- called to close modal without saving
 * - onDelete: async function(taskId) | function(taskId) -- optional
 */
const TaskEditForm = ({ task, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.detail || '')
  // datetime-local の value に変換（YYYY-MM-DDTHH:mm）
  const initialLimit = task.limit
    ? new Date(task.limit).toISOString().slice(0, 16)
    : ''
  const [limit, setLimit] = useState(initialLimit)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      alert('タイトルは必須です')
      return
    }

    const payload = {
      id: task.id,
      title: title.trim(),
      detail: description || '',
      done: !!task.done,
    }

    if (limit) {
      payload.limit = new Date(limit).toISOString()
    } else {
      payload.limit = undefined
    }

    if (typeof onSave !== 'function') {
      console.warn('TaskEditForm: onSave is not a function')
      return
    }

    setLoading(true)
    try {
      // await onSave so parent can perform async dispatch and then close modal on success
      await onSave(payload)
      // parent is expected to close modal when onSave resolves successfully
    } catch (err) {
      console.error('TaskEditForm onSave error:', err)
      // Display user-friendly error if available
      const msg = err?.message || (err?.ErrorMessageEN ?? '保存に失敗しました')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このタスクを削除してよいですか？')) return
    if (typeof onDelete !== 'function') {
      console.warn('TaskEditForm: onDelete is not provided')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await onDelete(task.id)
      // parent is expected to close modal when onDelete resolves successfully
    } catch (err) {
      console.error('TaskEditForm onDelete error:', err)
      const msg = err?.message || (err?.ErrorMessageEN ?? '削除に失敗しました')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="task-edit-form" onSubmit={handleSubmit}>
      <TextField
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <TextField
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
      />

      <TextField
        label="期限"
        type="datetime-local"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
      />

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? '保存中...' : '保存'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          キャンセル
        </Button>

        {/* optional delete button */}
        {typeof onDelete === 'function' && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDelete}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              background: '#fff',
              color: '#ef4444',
              border: '1px solid #ef4444',
            }}
          >
            {loading ? '処理中...' : '削除'}
          </Button>
        )}
      </div>
    </form>
  )
}

export default TaskEditForm
