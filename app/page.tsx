export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AxionJS MCP Server
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Model Context Protocol server for AxionJS component library
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">🚀 Features</h2>
            <ul className="text-left space-y-2">
              <li>• Component discovery and metadata</li>
              <li>• Dependency resolution</li>
              <li>• Code generation</li>
              <li>• Page templates</li>
              <li>• Theme management</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">🛠️ Tools Available</h2>
            <ul className="text-left space-y-2">
              <li>• get_component_list</li>
              <li>• install_components</li>
              <li>• generate_component_code</li>
              <li>• create_page_with_components</li>
              <li>• resolve_dependencies</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-900 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Server Status</h3>
          <p>Running on port 3001</p>
          <p>
            Registry URL:{" "}
            {process.env.AXION_REGISTRY_URL || "http://localhost:3000"}
          </p>
        </div>
      </div>
    </div>
  );
}
