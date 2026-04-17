function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-4xl font-bold text-gray-900">404</h2>
      <p className="mt-4 text-gray-600">页面未找到</p>
      <a
        href="/"
        className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        返回首页
      </a>
    </div>
  )
}

export default NotFoundPage
