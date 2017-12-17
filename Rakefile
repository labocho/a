
namespace "compile" do
  task "app" do
    rm_rf "docs"
    Dir.glob("app/**/*") do |path|
      next unless File.file?(path)
      path.gsub!(/^app\//, "")
      ruby "bin/compile", path
    end
  end

  task "manifest" do
    BASE_URL = "https://labocho.github.io/a/"
    buffer = []
    buffer << "CACHE MANIFEST"
    buffer << "# " + `git log --format=%H -1`.strip
    Dir.chdir "docs" do
      Dir.glob("**/*") do |path|
        next unless File.file?(path)
        buffer << BASE_URL + path
      end
    end
    File.write("docs/a.appcache", buffer.join("\n") + "\n")
  end

  task "all" => ["app", "manifest"]
end
task "compile" => ["compile:all"]

task "watch" do
  require "listen"
  listener = Listen.to("app", relative: true) do |modified, added, removed|
    (modified | added | removed).each do |path|
      path = path.gsub(/^app\//, "")
      ruby "bin/compile", path
    end
  end
  listener.start # not blocking
  sleep
end

task "server" do
  ruby "-run", "-e", "httpd", "--", "-p", "3000", "docs"
end
