import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector, Provider } from 'react-redux'
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { format } from 'date-fns'
import { FaTrash, FaEdit, FaPlus, FaCheckSquare } from 'react-icons/fa'
import ReactDOM from 'react-dom/client'

// NOTE: この部分は、以前のコンポーネントを統合したもので、変更はありません。
// --------------------------------------------------------------------------

// store/task/index.js
const taskInitialState = {
  tasks: [],
  isLoading: false,
}

export const fetchTask = createAsyncThunk(
  'task/fetchTask',
  async (_, thunkApi) => {
    try {
      const response = await axiosInstance.get(`/tasks`)
      return response.data
    } catch (e) {
      return handleThunkError(e, thunkApi)
    }
  }
)

export const addTask = createAsyncThunk(
  'task/addTask',
  async (task, thunkApi) => {
    try {
      const response = await axiosInstance.post(`/tasks`, task)
      return response.data
    } catch (e) {
      return handleThunkError(e, thunkApi)
    }
  }
)

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async (task, thunkApi) => {
    try {
      const response = await axiosInstance.put(`/tasks/${task.id}`, task)
      return response.data
    } catch (e) {
      return handleThunkError(e, thunkApi)
    }
  }
)

export const deleteTask =
  createAsync -
  Thunk('task/deleteTask', async (id, thunkApi) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`)
      return { id }
    } catch (e) {
      return handleThunkError(e, thunkApi)
    }
  })

export const taskSlice = createSlice({
  name: 'task',
  initialState: taskInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.tasks = action.payload
        state.isLoading = false
      })
      .addCase(fetchTask.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        )
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          (task) => task.id !== action.payload.id
        )
      })
  },
})

export const { resetTask } = taskSlice.actions

// store/list/index.js
const listInitialState = {
  lists: [],
  isLoading: false,
}

export const listSlice = createSlice({
  name: 'list',
  initialState: listInitialState,
  reducers: {
    setLists: (state, action) => {
      state.lists = action.payload
    },
    resetList: (state) => {
      state.lists = []
      state.isLoading = false
    },
  },
})

export const { setLists, resetList } = listSlice.actions

// utils/handleThunkError.js
const handleThunkError = (error, thunkApi) => {
  let message = '予期せぬエラーが発生しました。'
  if (error.response) {
    message = error.response.data.message || error.message
  } else if (error.request) {
    message = 'サーバーからの応答がありません。'
  } else {
    message = error.message
  }
  console.error('API Error:', message)
  return thunkApi.rejectWithValue(message)
}

// vendor/axios.js
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_RAILWAY_TODO_API_URL,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('railway-todo-app__token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('railway-todo-app__token')
      // 実際にはログインページにリダイレクト
      // window.location.href = '/login';
    }
    return Promise.reject(error)
  }
)

// store/auth/index.js
const authInitialState = {
  token: localStorage.getItem('railway-todo-app__token') || null,
  user: null,
  isLoading: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setUserIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
})

export const { setToken, setUserIsLoading, setUser } = authSlice.actions

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async ({ force = false } = {}, thunkApi) => {
    const isLoading = thunkApi.getState().auth.isLoading
    const hasUser = thunkApi.getState().auth.user !== null

    if (!force && (isLoading || hasUser)) {
      return
    }

    if (thunkApi.getState().auth.token === null) {
      return
    }

    thunkApi.dispatch(setUserIsLoading(true))

    try {
      const response = await axiosInstance.get(`/users`)
      thunkApi.dispatch(setUser(response.data))
    } catch (e) {
      return handleThunkError(e, thunkApi)
    } finally {
      thunkApi.dispatch(setUserIsLoading(false))
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (payload, thunkApi) => {
    try {
      const { email, password } = payload
      const response = await axiosInstance.post(`/signin`, {
        email,
        password,
      })

      localStorage.setItem('railway-todo-app__token', response.data.token)
      thunkApi.dispatch(setToken(response.data.token))
      void thunkApi.dispatch(fetchUser())
    } catch (e) {
      return handleThunkError(e, thunkApi)
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (payload, thunkApi) => {
    try {
      const { email, password, name } = payload
      const response = await axiosInstance.post(`/signup`, {
        email,
        password,
        name,
      })
      thunkApi.dispatch(setToken(response.data.token))
      void thunkApi.dispatch(fetchUser())
    } catch (e) {
      return handleThunkError(e, thunkApi)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_payload, thunkApi) => {
    localStorage.removeItem('railway-todo-app__token')
    thunkApi.dispatch(setToken(null))
    thunkApi.dispatch(setUser(null))
    thunkApi.dispatch(resetTask())
    thunkApi.dispatch(resetList())
  }
)

// Redux Storeの設定
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    task: taskSlice.reducer,
    list: listSlice.reducer,
  },
})

// --------------------------------------------------------------------------

// 共通コンポーネント: Button.jsx
const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// 共通コンポーネント: TextField.jsx
const TextField = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      type="text"
      ref={ref}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
})

// --------------------------------------------------------------------------

// Todo Appコンポーネント
function TodoApp() {
  const dispatch = useDispatch()
  const { tasks, isLoading } = useSelector((state) => state.task)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    dispatch(fetchTask())
    dispatch(fetchUser())
  }, [dispatch])

  const handleEdit = (task) => {
    setEditingTask(task)
  }

  const handleDelete = (id) => {
    dispatch(deleteTask(id))
  }

  const handleCloseModal = () => {
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          タスク管理
        </h1>
        <AddTaskForm />
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
      {editingTask && <Modal task={editingTask} onClose={handleCloseModal} />}
    </div>
  )
}

// タスク追加フォーム (修正版)
function AddTaskForm() {
  const dispatch = useDispatch()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { register, handleSubmit, reset, watch } = useForm()
  const nameValue = watch('name')

  const onSubmit = (data) => {
    if (data.name.trim() === '') {
      return
    }
    if (data.limit) {
      data.limit = new Date(data.limit).toISOString()
    }
    dispatch(addTask(data))
    reset()
    setIsFormVisible(false)
  }

  const handleDiscard = () => {
    reset()
    setIsFormVisible(false)
  }

  const handleOpenForm = () => {
    setIsFormVisible(true)
  }

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
      {!isFormVisible ? (
        <div
          onClick={handleOpenForm}
          className="flex items-center space-x-2 text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaPlus className="text-sm" />
          <span>新しいタスクを追加...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center space-x-2 text-gray-500 p-2">
            <FaCheckSquare className="text-green-500 text-sm" />
            <TextField
              placeholder="タスク名"
              {...register('name', { required: true })}
            />
          </div>
          <div className="flex justify-end space-x-2 p-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="bg-gray-200 text-gray-700 p-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              破棄
            </button>
            <Button
              type="submit"
              disabled={!nameValue || nameValue.trim() === ''}
              className="px-4"
            >
              追加
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// タスクリスト
function TaskList({ tasks, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return <div className="text-center text-gray-500 mt-8">読み込み中...</div>
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">タスクはありません。</div>
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const limitA = a.limit ? new Date(a.limit) : new Date(8640000000000000)
    const limitB = b.limit ? new Date(b.limit) : new Date(8640000000000000)
    return limitA - limitB
  })

  return (
    <ul className="space-y-4">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

// 個別タスクアイテム
function TaskItem({ task, onEdit, onDelete }) {
  const limitDate = task.limit ? new Date(task.limit) : null
  const now = new Date()
  const timeLeft = limitDate ? limitDate.getTime() - now.getTime() : null

  const formatTimeLeft = (ms) => {
    if (ms <= 0) return '期限切れ'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const s = seconds % 60
    const m = minutes % 60
    const h = hours % 24
    const d = days

    const parts = []
    if (d > 0) parts.push(`${d}日`)
    if (h > 0) parts.push(`${h}時間`)
    if (m > 0) parts.push(`${m}分`)
    if (parts.length === 0) parts.push(`${s}秒`)

    return parts.join('')
  }

  return (
    <li className="p-6 bg-white rounded-lg shadow-md flex justify-between items-center">
      <div>
        <p
          className={`text-lg font-semibold ${task.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {task.name}
        </p>
        {task.limit && (
          <>
            <p className="text-sm text-gray-500">
              期限: {format(limitDate, 'yyyy-MM-dd HH:mm')}
            </p>
            <p
              className={`text-sm font-medium ${timeLeft <= 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              残り: {formatTimeLeft(timeLeft)}
            </p>
          </>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-blue-500 hover:text-blue-700"
          aria-label="編集"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-red-500 hover:text-red-700"
          aria-label="削除"
        >
          <FaTrash />
        </button>
      </div>
    </li>
  )
}

// タスク編集モーダル
function Modal({ task, onClose }) {
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: task.name,
      is_done: task.is_done,
      limit: task.limit
        ? format(new Date(task.limit), "yyyy-MM-dd'T'HH:mm")
        : '',
    },
  })

  const onSubmit = (data) => {
    if (data.limit) {
      data.limit = new Date(data.limit).toISOString()
    } else {
      data.limit = null
    }
    dispatch(updateTask({ ...task, ...data }))
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">タスク編集</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">タスク名</label>
            <TextField {...register('name', { required: true })} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">期限日時</label>
            <input
              type="datetime-local"
              {...register('limit')}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              {...register('is_done')}
              id="is_done"
              className="mr-2"
            />
            <label htmlFor="is_done" className="text-gray-700">
              完了
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-400"
            >
              キャンセル
            </button>
            <Button type="submit">更新</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// React Providerでstoreをアプリケーションに提供
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <TodoApp />
    </Provider>
  </React.StrictMode>
)

export default TodoApp
