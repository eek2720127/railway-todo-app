// src/Router.jsx
import React from 'react'
import { useSelector } from 'react-redux'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Sidebar } from '~/components/Sidebar'
import Home from '~/pages/index.page'
import NotFound from '~/pages/404'
import SignIn from '~/pages/signin/index.page'
import NewList from '~/pages/list/new/index.page'
import EditTask from '~/pages/lists/[listId]/tasks/[taskId]/index.page'
import SignUp from '~/pages/signup/index.page'
import EditList from '~/pages/lists/[listId]/edit/index.page'
import ListIndex from '~/pages/lists/[listId]/index.page'

const RouterWrapper = () => {
  // useLocation をここで使って Sidebar の表示制御
  const location = useLocation()
  const hideSidebarFor = ['/signin', '/signup']
  const showSidebar = !hideSidebarFor.includes(location.pathname)

  return (
    <>
      {showSidebar ? (
        <Sidebar />
      ) : (
        // サイドバーを表示しない代わりに上部ヘッダーを表示したければここに追加
        <header className="top-header">
          <div className="top-header__inner">
            <h1>Todoアプリ</h1>
          </div>
        </header>
      )}
      <div
        className={
          showSidebar ? 'main_content with-sidebar' : 'main_content full'
        }
      >
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Home />} />
          <Route path="/lists/:listId" element={<ListIndex />} />
          <Route path="/list/new" element={<NewList />} />
          <Route path="/lists/:listId/tasks/:taskId" element={<EditTask />} />
          <Route path="/lists/:listId/edit" element={<EditList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}

export const Router = () => (
  <BrowserRouter>
    <RouterWrapper />
  </BrowserRouter>
)

export default Router
