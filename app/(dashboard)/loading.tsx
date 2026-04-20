export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#00bcd4', borderTopColor: 'transparent' }}
        />
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}
