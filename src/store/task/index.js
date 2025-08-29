// src/store/task/index.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { handleThunkError } from '~/utils/handleThunkError'
import axios from '~/vendor/axios'

const initialState = {
  tasks: [], // 空配列にしておく（nullだと push で落ちる）
  listId: null,
  isLoading: false,
}

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    resetTask: (state, _action) => {
      state.tasks = [] // null にしない
      state.listId = null
      state.isLoading = false
    },
    setTasks: (state, action) => {
      state.tasks = action.payload
    },
    setListId: (state, action) => {
      state.listId = action.payload
    },
    setTaskIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    addTask: (state, action) => {
      // payload 全体を push（limit があればそのまま入る）
      if (!state.tasks) state.tasks = []
      state.tasks.push(action.payload)
    },
    mutateTask: (state, action) => {
      const id = action.payload.id
      const idx = state.tasks.findIndex((t) => t.id === id)
      if (idx === -1) {
        return
      }

      state.tasks[idx] = {
        ...state.tasks[idx],
        ...action.payload,
      }
    },
    removeTask: (state, action) => {
      const id = action.payload.id
      state.tasks = state.tasks.filter((t) => t.id !== id)
    },
  },
})

export const {
  resetTask,
  setTasks,
  setListId,
  setTaskIsLoading,
  addTask,
  mutateTask,
  removeTask,
} = taskSlice.actions

// -------------------------
// fetchTasks（既存）
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async ({ force = false } = {}, thunkApi) => {
    const listId = thunkApi.getState().list.current
    const currentListId = thunkApi.getState().task.listId
    const isLoading = thunkApi.getState().task.isLoading

    if (!force && (currentListId === listId || isLoading)) {
      return
    }

    if (thunkApi.getState().auth.token === null) {
      return
    }

    thunkApi.dispatch(setTaskIsLoading(true))

    try {
      const res = await axios.get(`/lists/${listId}/tasks`)
      thunkApi.dispatch(setTasks(res.data.tasks || []))
      thunkApi.dispatch(setListId(listId))
    } catch (e) {
      handleThunkError(e, thunkApi)
    } finally {
      thunkApi.dispatch(setTaskIsLoading(false))
    }
  }
)

// -------------------------
// createTask（安全版）
export const createTask = createAsyncThunk(
  'task/createTask',
  async (payload, thunkApi) => {
    const listId = thunkApi.getState().list.current
    if (!listId) return

    try {
      // API仕様に合わせて body を作る
      const body = {
        title: payload.title,
        detail: payload.detail || '',
        done: false,
      }
      if (payload.limit) body.limit = payload.limit // payload.limit は ISO 形式であることを想定

      const res = await axios.post(`/lists/${listId}/tasks`, body, {
        headers: { 'Content-Type': 'application/json' },
      })

      // サーバから返ってきた id をマージして reducer に渡す
      const id = res.data?.id
      thunkApi.dispatch(addTask({ ...body, ...(id ? { id } : {}) }))
    } catch (e) {
      handleThunkError(e, thunkApi)
      console.error('createTask error:', e.response?.data || e.message)
    }
  }
)

// -------------------------
// updateTask（安全版）
export const updateTask = createAsyncThunk(
  'task/updateTask',
  async (payload, thunkApi) => {
    const listId = thunkApi.getState().list.current
    if (!listId) return

    const oldValue = thunkApi
      .getState()
      .task.tasks.find((t) => t.id === payload.id)
    if (!oldValue) return

    try {
      // API が期待する body の形に整形
      const body = {
        title: payload.title,
        detail: payload.detail || '',
        done: !!payload.done,
      }
      if (payload.limit) body.limit = payload.limit

      await axios.put(`/lists/${listId}/tasks/${payload.id}`, body, {
        headers: { 'Content-Type': 'application/json' },
      })

      // reducer 更新（payload に limit が含まれている想定）
      thunkApi.dispatch(mutateTask(payload))
    } catch (e) {
      handleThunkError(e, thunkApi)
      console.error('updateTask error:', e.response?.data || e.message)
    }
  }
)

// -------------------------
// deleteTask（既存）
export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (payload, thunkApi) => {
    try {
      const listId = thunkApi.getState().list.current
      if (!listId) return
      await axios.delete(`/lists/${listId}/tasks/${payload.id}`)
      thunkApi.dispatch(removeTask(payload))
    } catch (e) {
      handleThunkError(e, thunkApi)
    }
  }
)

export default taskSlice.reducer
