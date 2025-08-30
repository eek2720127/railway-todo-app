// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react'
import { ListIcon } from '~/icons/ListIcon'
import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'
import { PlusIcon } from '~/icons/PlusIcon'
import { useSelector, useDispatch } from 'react-redux'
import { useLogout } from '~/hooks/useLogout'
import { fetchLists, createList } from '~/store/list' // createList を期待
import Modal from '~/components/Modal'
import ListEditForm from '~/components/ListEditForm'

export const Sidebar = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Redux 側の値を取得（null の場合もある）
  const listsFromState = useSelector((state) => state.list.lists)
  const activeId = useSelector((state) => state.list.current)
  const isLoggedIn = useSelector((state) => state.auth.token !== null)
  const userName = useSelector((state) => state.auth.user?.name)

  // 安全のため、lists が配列でなければ空配列にフォールバックする
  const listsArray = Array.isArray(listsFromState) ? listsFromState : []

  // 既存の「/list/new」ページは使わないので shouldHighlight は常時 true に
  const shouldHighlight = true

  const { logout } = useLogout()

  useEffect(() => {
    void dispatch(fetchLists())
  }, [dispatch])

  // createList thunk がある想定。なければコンソールに警告するだけ。
  const handleCreateSave = async (payload) => {
    try {
      if (typeof createList === 'function') {
        // payload should be { title: '...' }
        await dispatch(createList(payload)).unwrap()
      } else {
        console.warn(
          'createList thunk not available in store/list. payload:',
          payload
        )
      }
      setIsCreateOpen(false)
    } catch (err) {
      console.error('createList failed', err)
      throw err
    }
  }

  return (
    <div className="sidebar">
      <Link to="/">
        <h1 className="sidebar__title">Todos</h1>
      </Link>

      {isLoggedIn ? (
        <>
          {listsArray.length > 0 && (
            <div className="sidebar__lists">
              <h2 className="sidebar__lists_title">Lists</h2>
              <ul className="sidebar__lists_items">
                {listsArray.map((listItem) => (
                  <li key={listItem.id}>
                    <Link
                      data-active={shouldHighlight && listItem.id === activeId}
                      to={`/lists/${listItem.id}`}
                      className="sidebar__lists_item"
                    >
                      <ListIcon aria-hidden className="sidebar__lists_icon" />
                      {listItem.title}
                    </Link>
                  </li>
                ))}

                <li>
                  <button
                    type="button"
                    className="sidebar__lists_button"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <PlusIcon className="sidebar__lists_plus_icon" />
                    New List...
                  </button>
                </li>
              </ul>
            </div>
          )}

          <div className="sidebar__spacer" aria-hidden />
          <div className="sidebar__account">
            <p className="sidebar__account_name">{userName}</p>
            <button
              type="button"
              className="sidebar__account_logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <Link to="/signin" className="sidebar__login">
          Login
        </Link>
      )}

      {/* モーダル部分 */}
      {isCreateOpen && (
        <Modal
          onClose={() => setIsCreateOpen(false)}
          ariaLabelledBy="create-list-title"
        >
          <h2 id="create-list-title">リストを作成</h2>
          {/* ← isNew を渡すのが重要です（新規はキャンセルボタン） */}
          <ListEditForm
            initialTitle=""
            isNew={true}
            onSave={handleCreateSave}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Sidebar
