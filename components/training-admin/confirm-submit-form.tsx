'use client'

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: (formData: FormData) => void
  confirmMessage: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {children}
    </form>
  )
}
