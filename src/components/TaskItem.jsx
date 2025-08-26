// src/components/TaskItem.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateTask, deleteTask } from '~/store/task'
import TaskEditForm from './TaskEditForm'
import './TaskItem.css'

const pad2 = (n) => String(n).padStart(2, '0')

function formatLocalDateTime(isoString) {
  // 表示フォーマット: YYYY-MM-DD HH:MM
  try {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = pad2(d.getMonth() + 1)
    const day = pad2(d.getDate())
    const hh = pad2(d.getHours())
    const mm = pad2(d.getMinutes())
    return `${y}-${m}-${day} ${hh}:${mm}`
  } catch {
    return ''
  }
}

function computeRemaining(isoString) {
  if (!isoString) return null
  const target = Date.parse(isoString)
  if (Number.isNaN(target)) return null
  const diff = target - Date.now() // ms
  const isPast = diff < 0
  let remaining = Math.abs(diff)

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  remaining -= days * 1000 * 60 * 60 * 24
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  remaining -= hours * 1000 * 60 * 60
  const minutes = Math.floor(remaining / (1000 * 60))

  return {
    isPast,
    days,
    hours,
    minutes,
  }
}

const RemainingText = ({ limit }) => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    // update every 30s to keep minute-accuracy (minutely is required)
    const id = setInterval(() => setTick((t) => t + 1), 30 * 1000)
    return () => clearInterval(id)
  }, [])

  const rem = useMemo(() => computeRemaining(limit), [limit, tick])

  if (!rem) return null

  const { isPast, days, hours, minutes } = rem
  const parts = []
  if (days > 0) parts.push(`${days}日`)
  if (hours > 0) parts.push(`${hours}時間`)
  parts.push(`${minutes}分`)

  return (
    <span className={`task-remaining ${isPast ? 'expired' : 'ok'}`}>
      {isPast ? '期限切れ: ' : '残り: '}
      {parts.join('')}
    </span>
  )
}

const TaskItem = ({ task }) => {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = React.useState(false)

  const handleSave = async (payload) => {
    // payload must include id, title, detail, done, maybe limit
    await dispatch(updateTask(payload))
      .unwrap?.()
      .catch(() => {})
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('削除してよいですか？')) return
    await dispatch(deleteTask({ id: task.id }))
      .unwrap?.()
      .catch(() => {})
  }

  return (
    <div className="task_item">
      {!isEditing ? (
        <>
          <div className="task_item__main">
            <div className="task_item__title">{task.title}</div>
            <div className="task_item__detail">{task.detail}</div>
            {task.limit && (
              <div className="task_item__limit">
                期限: {formatLocalDateTime(task.limit)}{' '}
                <RemainingText limit={task.limit} />
              </div>
            )}
          </div>

          <div className="task_item__actions">
            <button onClick={() => setIsEditing(true)}>編集</button>
            <button onClick={handleDelete}>削除</button>
          </div>
        </>
      ) : (
        <TaskEditForm
          task={task}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}

export default TaskItem
