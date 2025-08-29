// src/components/TaskCreateForm.jsx
import React, { useState } from 'react'
import TextField from './ui/TextField'
import Button from './ui/Button'
import './TaskCreateForm.css'

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
      // detail が空なら既定値を入れる（A の方法）
      detail:
        description && description.trim() ? description.trim() : '（詳細なし）',
      done: false,
    }

    if (limit) {
      taskData.limit = new Date(limit).toISOString()
    }

    if (typeof onSubmit === 'function') {
      onSubmit(taskData)
    }

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
