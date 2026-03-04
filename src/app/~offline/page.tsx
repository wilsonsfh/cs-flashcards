export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
        <p className="text-muted-foreground">
          CS Flashcards requires an internet connection to sync your progress.
          Please check your connection and try again.
        </p>
      </div>
    </div>
  )
}
