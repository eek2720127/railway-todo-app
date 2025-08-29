// src/pages/lists/[listId]/index.page.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import TaskItem from '~/components/TaskItem'
import TaskCreateForm from '~/components/TaskCreateForm'
import Modal from '~/components/Modal'
import ListEditForm from '~/components/ListEditForm'
import { setCurrentList, deleteList, updateList } from '~/store/list' // ← deleteList, updateList を追加
import { fetchTasks, createTask } from '~/store/task'
import './index.css'

const ListIndex = () => {
  const dispatch = useDispatch()
  const { listId } = useParams()
  const [isListEditOpen, setIsListEditOpen] = useState(false)

  const isLoading = useSelector(
    (state) => state.task.isLoading || state.list.isLoading
  )
  const tasks = useSelector((state) => state.task.tasks)
  const listName = useSelector((state) => {
    const currentId = state.list.current
    const list = state.list.lists?.find((l) => l.id === currentId)
    return list?.title
  })

  useEffect(() => {
    dispatch(setCurrentList(listId))
    void dispatch(fetchTasks()).unwrap?.()
  }, [dispatch, listId])

  const handleCreateTask = async (taskData) => {
    try {
      await dispatch(createTask(taskData)).unwrap?.()
    } catch (err) {
      console.error('createTask error', err)
    }
  }

  const openListEdit = () => setIsListEditOpen(true)
  const closeListEdit = () => setIsListEditOpen(false)

  // Update handler: dispatch updateList and close modal on success
  const handleListSave = async (payload) => {
    try {
      // payload expected: { id, title }
      await dispatch(updateList(payload)).unwrap()
      closeListEdit()
    } catch (err) {
      console.error('updateList failed', err)
      // rethrow if child expects it
      throw err
    }
  }

  const handleListDelete = async (id) => {
    try {
      await dispatch(deleteList({ id })).unwrap()
      closeListEdit()
    } catch (err) {
      console.error('deleteList failed', err)
      throw err
    }
  }

  return (
    <div className="tasks_list">
      <div className="tasks_list__title">
        {listName}
        <div className="tasks_list__title_spacer" />
        <button className="app_button" onClick={openListEdit}>
          Edit...
        </button>
      </div>

      <div className="tasks_list__items">
        <TaskCreateForm onSubmit={handleCreateTask} />
        {tasks?.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {tasks?.length === 0 && (
          <div className="tasks_list__items__empty">No tasks yet!</div>
        )}
      </div>

      {isListEditOpen && (
        <Modal onClose={closeListEdit} ariaLabelledBy="list-edit-title">
          <h2 id="list-edit-title">リストを編集</h2>
          <ListEditForm
            listId={listId}
            initialTitle={listName}
            onSave={handleListSave} // ← 親で更新処理を行う
            onDelete={handleListDelete} // ← 親で削除処理を行う（必須）
            // onCancel not needed because Modal onClose handles closing,
            // but ListEditForm may still call onCancel if implemented.
            onCancel={closeListEdit}
          />
        </Modal>
      )}
    </div>
  )
}

export default ListIndex
