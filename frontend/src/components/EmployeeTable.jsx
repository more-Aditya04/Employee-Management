
import { useEffect, useState } from 'react'
import { api, notify } from '../api'

export default function EmployeeTable({ onEdit }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')

  const fetchData = async () => {
    try {
      const params = { page, page_size: pageSize }
      if (search) params.search = search
      if (department) params.department = department
      if (status) params.status = status
      const { data } = await api.get('/employees', { params })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      notify('Failed to load employees', 'error')
    }
  }

  useEffect(() => { fetchData() }, [page, pageSize, search, department, status])

  const onDelete = async (id) => {
    if (!confirm('Do u want to delete this employee')) return
    try {
      await api.delete(`/employees/${id}`)
      notify('Deleted', 'success')
      fetchData()
    } catch {
      notify('Delete failed', 'error')
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1

  // Styling helpers (no behavior change)
  const statusBadgeClass = (s) => {
    if (s === 'ACTIVE') return 'badge rounded-pill text-bg-success'
    if (s === 'ON_LEAVE') return 'badge rounded-pill text-bg-warning'
    if (s === 'TERMINATED') return 'badge rounded-pill text-bg-danger'
    return 'badge rounded-pill text-bg-secondary'
  }

  return (
    <div
      className="card border-0 shadow-sm"
      style={{ borderRadius: 14, overflow: 'hidden' }}
    >
      <div className="card-body p-3 p-md-4">
        {/* Header row */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <div className="fw-bold" style={{ fontSize: '1.15rem', color: '#1a2b4c' }}>
              Employees
            </div>
            <div className="text-muted" style={{ fontSize: '.9rem' }}>
              Search, filter and manage your employee records
            </div>
          </div>

          <div className="text-muted" style={{ fontSize: '.9rem' }}>
            Total: <span className="fw-semibold">{total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <span
                className="input-group-text bg-light border-0"
                style={{ borderRadius: 10 }}
              >
                <i className="bi bi-search"></i>
              </span>
              <input
                className="form-control border-0 bg-light"
                style={{ borderRadius: 10, padding: '10px 12px', fontSize: '.95rem' }}
                placeholder="Search name/email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <input
              className="form-control bg-light border-0"
              style={{ borderRadius: 10, padding: '10px 12px', fontSize: '.95rem' }}
              placeholder="Filter by department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select bg-light border-0"
              style={{ borderRadius: 10, padding: '10px 12px', fontSize: '.95rem' }}
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">Status: All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_LEAVE">ON_LEAVE</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select bg-light border-0"
              style={{ borderRadius: 10, padding: '10px 12px', fontSize: '.95rem' }}
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: '.95rem' }}>
            <thead
              className="table-light"
              style={{ position: 'sticky', top: 0, zIndex: 1 }}
            >
              <tr>
                <th className="text-muted" style={{ fontWeight: 700 }}>#</th>
                <th className="text-muted" style={{ fontWeight: 700 }}>Name</th>
                <th className="text-muted" style={{ fontWeight: 700 }}>Email</th>
                <th className="text-muted" style={{ fontWeight: 700 }}>Dept</th>
                <th className="text-muted" style={{ fontWeight: 700 }}>Title</th>
                <th className="text-muted" style={{ fontWeight: 700 }}>Status</th>
                <th className="text-muted" style={{ fontWeight: 700 }}>Joined</th>
                <th className="text-muted text-end" style={{ fontWeight: 700 }}></th>
              </tr>
            </thead>

            <tbody>
              {items.map((e) => (
                <tr key={e.id} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <td className="text-muted">{e.id}</td>

                  <td>
                    <div className="fw-semibold" style={{ color: '#1a2b4c' }}>
                      {e.first_name} {e.last_name}
                    </div>
                    <div className="text-muted" style={{ fontSize: '.85rem' }}>
                      {e.title || '-'}
                    </div>
                  </td>

                  <td className="text-muted">{e.email}</td>
                  <td className="text-muted">{e.department || '-'}</td>
                  <td className="text-muted">{e.title || '-'}</td>

                  <td>
                    <span className={statusBadgeClass(e.status)} style={{ fontSize: '.82rem' }}>
                      {e.status}
                    </span>
                  </td>

                  <td className="text-muted">{e.date_joined}</td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm me-2"
                      onClick={() => onEdit(e)}
                      style={{
                        backgroundColor: '#e8f0ff',
                        color: '#1a2b4c',
                        fontWeight: 600,
                        borderRadius: 10,
                        padding: '6px 10px'
                      }}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Edit
                    </button>

                    <button
                      className="btn btn-sm"
                      onClick={() => onDelete(e.id)}
                      style={{
                        backgroundColor: '#ffe8ea',
                        color: '#b42318',
                        fontWeight: 600,
                        borderRadius: 10,
                        padding: '6px 10px'
                      }}
                    >
                      <i className="bi bi-trash3 me-1"></i>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="text-muted" style={{ fontSize: '1rem' }}>
                      No employees found.
                    </div>
                    <div className="text-muted" style={{ fontSize: '.9rem' }}>
                      Try changing filters or search keywords.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
          <div className="text-muted" style={{ fontSize: '.92rem' }}>
            Showing page <span className="fw-semibold">{page}</span> of{' '}
            <span className="fw-semibold">{totalPages}</span> (Total:{' '}
            <span className="fw-semibold">{total}</span>)
          </div>

          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ borderRadius: 10 }}
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <i className="bi bi-chevron-left me-1"></i>
              Prev
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ borderRadius: 10 }}
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}


