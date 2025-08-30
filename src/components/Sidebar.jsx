// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react'
import { ListIcon } from '~/icons/ListIcon'
import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'
import { PlusIcon } from '~/icons/PlusIcon'
import { useSelector, useDispatch } from 'react-redux'
import { useLogout } from '~/hooks/useLogout'
import { fetchLists, createList } from '~/store/list'
import Modal from '~/components/Modal'
import ListEditForm from '~/components/ListEditForm'

export const Sidebar = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const listsFromState = useSelector((state) => state.list.lists)
  const activeId = useSelector((state) => state.list.current)
  const isLoggedIn = useSelector((state) => state.auth.token !== null)
  const userName = useSelector((state) => state.auth.user?.name)

  const listsArray = Array.isArray(listsFromState) ? listsFromState : []

  // desktop always highlight behavior (keep as before)
  const shouldHighlight = true

  const { logout } = useLogout()

  useEffect(() => {
    void dispatch(fetchLists())
  }, [dispatch])

  const handleCreateSave = async (payload) => {
    try {
      if (typeof createList === 'function') {
        await dispatch(createList(payload)).unwrap()
      } else {
        console.warn('createList thunk not available', payload)
      }
      setIsCreateOpen(false)
    } catch (err) {
      console.error('createList failed', err)
      throw err
    }
  }

  // mobile drawer open/close
  const openMobile = () => setIsMobileOpen(true)
  const closeMobile = () => setIsMobileOpen(false)

  // ----- Sidebar content as a function so we can reuse in modal -----
  const SidebarContent = ({ onClose }) => (
    <div className="sidebar_inner">
      <h1 className="sidebar__title">Todos</h1>

      {isLoggedIn ? (
        <>
          <div className="sidebar__lists">
            <h2 className="sidebar__lists_title">Lists</h2>
            <ul className="sidebar__lists_items">
              {listsArray.map((listItem) => (
                <li key={listItem.id}>
                  <Link
                    data-active={shouldHighlight && listItem.id === activeId}
                    to={`/lists/${listItem.id}`}
                    className="sidebar__lists_item"
                    onClick={onClose} // close drawer on navigation
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
                  onClick={() => {
                    setIsCreateOpen(true)
                    if (onClose) onClose()
                  }}
                >
                  <PlusIcon className="sidebar__lists_plus_icon" />
                  New List...
                </button>
              </li>
            </ul>
          </div>

          <div className="sidebar__spacer" aria-hidden />
          <div className="sidebar__account">
            <p className="sidebar__account_name">{userName}</p>
            <button
              type="button"
              className="sidebar__account_logout"
              onClick={() => {
                logout()
                if (onClose) onClose()
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <Link to="/signin" className="sidebar__login" onClick={onClose}>
          Login
        </Link>
      )}
    </div>
  )

  return (
    <>
      {/* Hamburger button - visible only on mobile via CSS */}
      <button
        className="sidebar__hamburger"
        aria-label="Open navigation"
        aria-expanded={isMobileOpen}
        aria-controls="mobile-nav"
        onClick={openMobile}
      >
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden>
          <rect y="0" width="20" height="2" rx="1" />
          <rect y="6" width="20" height="2" rx="1" />
          <rect y="12" width="20" height="2" rx="1" />
        </svg>
      </button>

      {/* Desktop sidebar (hidden on mobile via CSS) */}
      <aside className="sidebar" aria-hidden={isMobileOpen}>
        <SidebarContent />
      </aside>

      {/* Create modal (unchanged) */}
      {isCreateOpen && (
        <Modal
          onClose={() => setIsCreateOpen(false)}
          ariaLabelledBy="create-list-title"
        >
          <h2 id="create-list-title">リストを作成</h2>
          <ListEditForm
            initialTitle=""
            isNew={true}
            onSave={handleCreateSave}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}

      {/* Mobile drawer (Modal reuse) */}
      {isMobileOpen && (
        <Modal onClose={closeMobile} ariaLabelledBy="mobile-nav-title">
          {/* Give wrapper an id referenced by aria-controls */}
          <div
            id="mobile-nav"
            className="mobile_drawer"
            role="navigation"
            aria-label="サイドメニュー"
          >
            <div className="mobile_drawer_header">
              <h2 id="mobile-nav-title">Navigation</h2>
              <button
                className="mobile_drawer_close"
                aria-label="Close menu"
                onClick={closeMobile}
              >
                ×
              </button>
            </div>
            <div className="mobile_drawer_body">
              <SidebarContent onClose={closeMobile} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default Sidebar
