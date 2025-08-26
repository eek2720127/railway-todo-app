// src/components/TaskCreateForm.jsx
import React, { useState } from 'react'
import TextField from './ui/TextField'
import Button from './ui/Button'
import './TaskCreateForm.css' // ← 正しいファイル名に修正

const TaskCreateForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [limit, setLimit] = useState('') // datetime-local value

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('タイトルは必須です')
      return
    }

    const taskData = {
      title: title.trim(),
      detail: description || '',
      done: false,
    }

    if (limit) {
      // datetime-local -> ISO with Z
      taskData.limit = new Date(limit).toISOString()
    }

    onSubmit?.(taskData) // 安全呼び出し
    setTitle('')
    setDescription('')
    setLimit('')
  }

  return (
    <form className="task-create-form" onSubmit={handleSubmit}>
      <TextField
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タスク名"
        required
      />
      <TextField
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="詳細（任意）"
        multiline
        rows={3}
      />
      <TextField
        label="期限"
        type="datetime-local"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder=""
      />
      <Button type="submit" variant="primary">
        作成
      </Button>
    </form>
  )
}

export default TaskCreateForm
