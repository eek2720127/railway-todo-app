// src/components/TaskItem.jsx (差分：モーダル対応)
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateTask, deleteTask } from '~/store/task'
import Modal from './Modal'
import TaskEditForm from './TaskEditForm'
import './TaskItem.css'

const TaskItem = ({ task }) => {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOpenEdit = () => setIsEditing(true)
  const handleCloseEdit = () => setIsEditing(false)

  const handleSave = async (payload) => {
    // payload should include id, title, detail, done, maybe limit
    setLoading(true)
    try {
      // unwrap to catch reject
      await dispatch(updateTask(payload)).unwrap()
      // success -> close modal
      handleCloseEdit()
    } catch (err) {
      console.error('update failed', err)
      // show error to user if desired
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('削除してよいですか？')) return
    setLoading(true)
    try {
      await dispatch(deleteTask({ id: task.id })).unwrap()
      // success -> close modal if open
      handleCloseEdit()
    } catch (err) {
      console.error('delete failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="task_item">
      <div className="task_item__main">
        <div className="task_item__title">{task.title}</div>
        <div className="task_item__detail">{task.detail}</div>
        {task.limit && (
          <div className="task_item__limit">期限: {task.limit}</div>
        )}
      </div>

      <div className="task_item__actions">
        <button onClick={handleOpenEdit}>編集</button>
        <button onClick={handleDelete}>削除</button>
      </div>

      {isEditing && (
        <Modal
          onClose={handleCloseEdit}
          ariaLabelledBy={`task-edit-${task.id}-title`}
        >
          <h2 id={`task-edit-${task.id}-title`}>タスクを編集</h2>
          <TaskEditForm
            task={task}
            onSave={handleSave}
            onCancel={handleCloseEdit}
          />
          {/* TaskEditForm は onSave（payload）を期待、内部で dispatch せず親で dispatch する設計でも可 */}
        </Modal>
      )}
    </div>
  )
}

export default TaskItem
