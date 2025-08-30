// src/pages/lists/[listId]/index.page.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import TaskItem from '~/components/TaskItem'
import TaskCreateForm from '~/components/TaskCreateForm'
import Modal from '~/components/Modal'
import ListEditForm from '~/components/ListEditForm'
import { setCurrentList, deleteList, updateList } from '~/store/list'
import { fetchTasks, createTask } from '~/store/task'
import './index.css'

const ListIndex = () => {
  const dispatch = useDispatch()
  const { listId } = useParams()
  const navigate = useNavigate()
  const [isListEditOpen, setIsListEditOpen] = useState(false)

  const isLoading = useSelector(
    (state) => state.task.isLoading || state.list.isLoading
  )
  const tasks = useSelector((state) => state.task.tasks)
  const listName = useSelector(() => {
    const currentId = (state) => state.list.current
    // NOTE: avoid using selector closure here; use a straight selector instead:
    // but to keep consistent with your project structure, use below:
    const s = window.__REDUX_STORE_PREVIEW__ // noop; we'll use another safer approach
    return null
  })

  // better selectors:
  const tasksState = useSelector((state) => state.task.tasks)
  const listTitle = useSelector((state) => {
    const currentId = state.list.current
    const list = state.list.lists?.find((l) => l.id === currentId)
    return list?.title
  })
  // use these for rendering
  const currentTasks = tasksState
  const currentListName = listTitle

  useEffect(() => {
    // set current list and fetch tasks for it
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

  // Update handler: dispatch updateList and close modal on success.
  // If update fails, let the error bubble up so child shows message.
  const handleListSave = async (payload) => {
    // payload expected: { id, title }
    // parent does not swallow the error: child will display it
    await dispatch(updateList(payload)).unwrap()
    closeListEdit()
  }

  // Delete handler: dispatch deleteList and navigate away to avoid 404.
  const handleListDelete = async (id) => {
    await dispatch(deleteList({ id })).unwrap()
    // close modal & navigate to root (prevent fetchTasks 404 on deleted id)
    closeListEdit()
    navigate('/')
  }

  if (isLoading) {
    return <div></div>
  }

  return (
    <div className="tasks_list">
      <div className="tasks_list__title">
        {currentListName}
        <div className="tasks_list__title_spacer" />
        <button className="app_button" onClick={openListEdit}>
          Edit...
        </button>
      </div>

      <div className="tasks_list__items">
        <TaskCreateForm onSubmit={handleCreateTask} />
        {currentTasks?.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {currentTasks?.length === 0 && (
          <div className="tasks_list__items__empty">No tasks yet!</div>
        )}
      </div>

      {isListEditOpen && (
        <Modal onClose={closeListEdit} ariaLabelledBy="list-edit-title">
          <h2 id="list-edit-title">タスクを編集</h2>
          <ListEditForm
            listId={listId}
            initialTitle={currentListName}
            onSave={handleListSave}
            onDelete={handleListDelete}
            onCancel={closeListEdit}
          />
        </Modal>
      )}
    </div>
  )
}

export default ListIndex
