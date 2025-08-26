// src/components/TaskEditForm.jsx
import React, { useState } from 'react'
import TextField from '~/components/ui/TextField.jsx'
import Button from './ui/Button'
import './TaskCreateForm.css' // 再利用してOK

const TaskEditForm = ({ task, onSave, onCancel }) => {
  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.detail || '')
  // task.limit が ISO 形式（例: 2023-12-12T23:59:59Z）なら datetime-local の value に変換する
  const initialLimit = task.limit
    ? new Date(task.limit).toISOString().slice(0, 16)
    : ''
  const [limit, setLimit] = useState(initialLimit)

  const handleSubmit = (e) => {
    e.preventDefault()
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
      // undefined -> avoid sending null; keep server handling
      payload.limit = undefined
    }

    onSave(payload)
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
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button type="submit">保存</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}

export default TaskEditForm
