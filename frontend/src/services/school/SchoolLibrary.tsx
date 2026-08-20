import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { BookOpen, Plus, Pencil, Trash2, Undo2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { LibraryBook, LibraryIssue, Student, StaffMember } from './types'
import { BOOK_SEED, ISSUE_SEED, STUDENT_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'

export default function SchoolLibrary() {
  const { items: books, add: addBook, update: updateBook, remove: removeBook } = useLocalCollection<LibraryBook>('school:books', BOOK_SEED)
  const { items: issues, add: addIssue, update: updateIssue, remove: removeIssue } = useLocalCollection<LibraryIssue>('school:issues', ISSUE_SEED)
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const [bookModal, setBookModal] = useState(false)
  const [issueModal, setIssueModal] = useState(false)
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null)
  const [editingIssue, setEditingIssue] = useState<LibraryIssue | null>(null)
  const [bookForm, setBookForm] = useState({ isbn: '', title: '', author: '', category: '', copies: 1, available: 1 })
  const [issueForm, setIssueForm] = useState({ bookId: books[0]?.id ?? '', memberType: 'student' as LibraryIssue['memberType'], memberId: '', issueDate: new Date().toISOString().slice(0, 10), dueDate: '' })
  const [tab, setTab] = useState('books')

  const bookColumns: DataColumn<LibraryBook>[] = [
    { key: 'title', header: 'Title', render: (b) => <span className="font-medium">{b.title}</span>, sortValue: (b) => b.title },
    { key: 'author', header: 'Author', render: (b) => b.author },
    { key: 'category', header: 'Category', render: (b) => b.category, hideOnMobile: true },
    { key: 'copies', header: 'Copies', render: (b) => b.copies },
    { key: 'available', header: 'Available', render: (b) => <span className={b.available === 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>{b.available}</span>, sortValue: (b) => b.available },
  ]

  const issueColumns: DataColumn<LibraryIssue>[] = [
    { key: 'bookTitle', header: 'Book', render: (i) => <span className="font-medium">{i.bookTitle}</span>, sortValue: (i) => i.bookTitle },
    { key: 'memberName', header: 'Member', render: (i) => <span>{i.memberName}<span className="text-xs text-muted"> ({i.memberType})</span></span>, sortValue: (i) => i.memberName },
    { key: 'issueDate', header: 'Issued', render: (i) => i.issueDate.slice(0, 10) },
    { key: 'dueDate', header: 'Due', render: (i) => {
      const overdue = !i.returnDate && i.dueDate < new Date().toISOString().slice(0, 10)
      return <span className={overdue ? 'text-red-600 font-semibold' : 'text-text'}>{i.dueDate.slice(0, 10)}{overdue ? ' (overdue)' : ''}</span>
    }, sortValue: (i) => i.dueDate },
    { key: 'returnDate', header: 'Returned', render: (i) => i.returnDate ? <span className="text-emerald-600">{i.returnDate.slice(0, 10)}</span> : <span className="text-muted text-sm">—</span> },
  ]

  function openAddBook() {
    setEditingBook(null)
    setBookForm({ isbn: '', title: '', author: '', category: '', copies: 1, available: 1 })
    setBookModal(true)
  }

  function openEditBook(b: LibraryBook) {
    setEditingBook(b)
    setBookForm({ isbn: b.isbn, title: b.title, author: b.author, category: b.category, copies: b.copies, available: b.available })
    setBookModal(true)
  }

  function saveBook() {
    if (!bookForm.title.trim()) return
    const payload = { ...bookForm, copies: Number(bookForm.copies), available: Number(bookForm.available) }
    if (editingBook) updateBook(editingBook.id, payload)
    else addBook({ id: genId(), ...payload })
    setBookModal(false)
  }

  function openAddIssue() {
    setEditingIssue(null)
    setIssueForm({ bookId: books[0]?.id ?? '', memberType: 'student', memberId: students[0]?.id ?? '', issueDate: new Date().toISOString().slice(0, 10), dueDate: '' })
    setIssueModal(true)
  }

  function openEditIssue(i: LibraryIssue) {
    setEditingIssue(i)
    setIssueForm({ bookId: i.bookId, memberType: i.memberType, memberId: i.memberId, issueDate: i.issueDate, dueDate: i.dueDate })
    setIssueModal(true)
  }

  function saveIssue() {
    const book = books.find((b) => b.id === issueForm.bookId)
    const pool = issueForm.memberType === 'student' ? students : staff
    const member = pool.find((m) => m.id === issueForm.memberId)
    const payload = { ...issueForm, bookTitle: book?.title ?? '', memberName: member?.name ?? '' }
    if (editingIssue) updateIssue(editingIssue.id, payload)
    else {
      addIssue({ id: genId(), ...payload })
      const b = books.find((x) => x.id === issueForm.bookId)
      if (b && b.available > 0) updateBook(b.id, { available: b.available - 1 })
    }
    setIssueModal(false)
  }

  function returnBook(i: LibraryIssue) {
    updateIssue(i.id, { returnDate: new Date().toISOString().slice(0, 10) })
    const b = books.find((x) => x.id === i.bookId)
    if (b) updateBook(b.id, { available: b.available + 1 })
  }

  const totalCopies = books.reduce((s, b) => s + b.copies, 0)
  const out = issues.filter((i) => !i.returnDate).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Books" value={books.length} icon={<BookOpen className="w-5 h-5" />} tone="info" />
        <KPICard label="Total copies" value={totalCopies} icon={<BookOpen className="w-5 h-5" />} tone="default" />
        <KPICard label="Checked out" value={out} icon={<BookOpen className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="books">Catalogue</TabsTrigger>
              <TabsTrigger value="issues">Issues & returns</TabsTrigger>
            </TabsList>
            <TabsContent value="books" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddBook}><Plus className="w-4 h-4" /> Add book</Button>
              </div>
              <DataTable
                columns={bookColumns}
                rows={books}
                rowKey={(b) => b.id}
                pageSize={10}
                exportFilename="school-books"
                emptyIcon={<BookOpen className="w-6 h-6" />}
                emptyTitle="No books in catalogue"
                emptyDescription="Add books to build your library catalogue."
                actions={(b) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditBook(b)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeBook(b.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="issues" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddIssue}><Plus className="w-4 h-4" /> Issue book</Button>
              </div>
              <DataTable
                columns={issueColumns}
                rows={issues}
                rowKey={(i) => i.id}
                pageSize={10}
                exportFilename="school-library-issues"
                emptyIcon={<BookOpen className="w-6 h-6" />}
                emptyTitle="No issues"
                emptyDescription="Issue books to students and staff."
                actions={(i) => (
                  <div className="flex gap-1">
                    {!i.returnDate && (
                      <Button variant="ghost" size="icon" onClick={() => returnBook(i)} aria-label="Return"><Undo2 className="w-4 h-4 text-emerald-500" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditIssue(i)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeIssue(i.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={bookModal} onClose={() => setBookModal(false)} title={editingBook ? 'Edit book' : 'Add book'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} /></div>
            <div><Label>Author</Label><Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>ISBN</Label><Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Copies</Label><Input type="number" value={bookForm.copies} onChange={(e) => setBookForm({ ...bookForm, copies: Number(e.target.value) })} /></div>
            <div><Label>Available</Label><Input type="number" value={bookForm.available} onChange={(e) => setBookForm({ ...bookForm, available: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setBookModal(false)}>Cancel</Button>
            <Button onClick={saveBook}>{editingBook ? 'Save changes' : 'Add book'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={issueModal} onClose={() => setIssueModal(false)} title={editingIssue ? 'Edit issue' : 'Issue book'} size="md">
        <div className="space-y-4">
          <div>
            <Label>Book</Label>
            <Select value={issueForm.bookId} onValueChange={(v) => setIssueForm({ ...issueForm, bookId: v })}>
              {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Member type</Label>
              <Select value={issueForm.memberType} onValueChange={(v) => {
                const t = v as LibraryIssue['memberType']
                setIssueForm({ ...issueForm, memberType: t, memberId: (t === 'student' ? students : staff)[0]?.id ?? '' })
              }}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </Select>
            </div>
            <div>
              <Label>Member</Label>
              <Select value={issueForm.memberId} onValueChange={(v) => setIssueForm({ ...issueForm, memberId: v })}>
                {(issueForm.memberType === 'student' ? students : staff).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Issue date</Label><Input type="date" value={issueForm.issueDate} onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })} /></div>
            <div><Label>Due date</Label><Input type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIssueModal(false)}>Cancel</Button>
            <Button onClick={saveIssue}>{editingIssue ? 'Save changes' : 'Issue book'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}