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
    setError(null)
  }, [initialTitle, listId])

  const extractServerMessage = (err) => {
    // API の返す形は色々あり得るので可能な箇所を順に参照
    return (
      err?.ErrorMessageJP ||
      err?.ErrorMessageEN ||
      err?.message ||
      err?.response?.data?.ErrorMessageJP ||
      err?.response?.data?.ErrorMessageEN ||
      err?.response?.data?.message ||
      null
    )
  }

  const translateMessage = (msg) => {
    if (!msg) return null
    // 既知の英語メッセージを日本語に変換（必要なら追加）
    if (msg === 'This list is not reviewed yet.') {
      return 'このリストはまだレビューされていないため、操作できません（APIの制約）'
    }
    if (msg === 'validation error') {
      return '入力に誤りがあります。内容を確認してください。'
    }
    // デフォルトはそのまま表示
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError('タイトルは必須です')
      return
    }

    const payload = { id: listId, title: title.trim() }

    if (typeof onSave !== 'function') {
      console.warn('ListEditForm: onSave not provided')
      return
    }

    try {
      setLoading(true)
      // 親の onSave が thunk を呼んで reject するとここで catch される
      await onSave(payload)
      // 成功したら parent がモーダルを閉じる設計なのでここでは何もしない
    } catch (err) {
      const serverMsg = extractServerMessage(err)
      const translated = translateMessage(serverMsg) || '保存に失敗しました'
      console.error('ListEditForm onSave error:', err)
      setError(translated)
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
      // parent は成功時にモーダルを閉じたり遷移したりする想定
    } catch (err) {
      const serverMsg = extractServerMessage(err)
      const translated = translateMessage(serverMsg) || '削除に失敗しました'
      console.error('ListEditForm onDelete error:', err)
      setError(translated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="list-edit-form">
      <TextField
        label="タスク名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タスク名を入力"
        required
      />

      {error && (
        <div className="list-edit-error" role="alert" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}
      >
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? isNew
              ? '処理中...'
              : '処理中...'
            : isNew
              ? '作成'
              : '更新'}
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
