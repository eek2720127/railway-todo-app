// src/components/ListEditForm.jsx
import React, { useEffect, useState } from 'react'
import TextField from '~/components/ui/TextField'
import Button from './ui/Button'
import './ListEditForm.css'

/**
 * Props:
 * - listId?: string
 * - initialTitle?: string
 * - onSave: async function(payload) | function(payload)
 * - onDelete?: async function(listId)   // 編集時のみ使う
 * - onCancel?: function()               // 新規作成時のみ使う
 * - isNew?: boolean                     // 新規作成フォームかどうか
 */
const ListEditForm = ({
  listId,
  initialTitle = '',
  onSave,
  onDelete,
  onCancel,
  isNew = false,
}) => {
  const [title, setTitle] = useState(initialTitle)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTitle(initialTitle || '')
  }, [initialTitle, listId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      alert('タイトルは必須です')
      return
    }

    const payload = { id: listId, title: title.trim() }

    if (typeof onSave !== 'function') {
      console.warn('ListEditForm: onSave not provided')
      return
    }

    try {
      setLoading(true)
      await onSave(payload)
    } catch (err) {
      console.error('ListEditForm onSave error:', err)
      setError(err?.message || '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm('このリストを削除してよいですか？（この操作は取り消せません）')
    )
      return
    if (typeof onDelete !== 'function') {
      console.warn('ListEditForm: onDelete not provided')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await onDelete(listId)
    } catch (err) {
      console.error('ListEditForm onDelete error:', err)
      setError(err?.message || '削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="list-edit-form">
      <TextField
        label="リスト名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="リスト名を入力"
        required
      />

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}
      >
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? '保存中...' : isNew ? 'Create' : 'Update'}
        </Button>

        <div style={{ marginLeft: 'auto' }}>
          {isNew ? (
            // 新規 → キャンセルボタン
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              キャンセル
            </Button>
          ) : (
            // 編集 → 削除ボタン
            <Button
              type="button"
              variant="secondary"
              onClick={handleDelete}
              disabled={loading}
              style={{
                background: '#fff',
                color: '#ef4444',
                border: '1px solid #ef4444',
              }}
            >
              {loading ? '処理中...' : '削除'}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

export default ListEditForm
