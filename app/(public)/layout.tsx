export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        src="https://analytics.ahrefs.com/analytics.js"
        data-key="bNVjI8BYXvoXUULdLLZhPA"
        async
      />
      {children}
    </>
  )
}
