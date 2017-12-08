task "compile" do
  rm_rf "public"
  Dir.glob("app/**/*") do |path|
    next unless File.file?(path)
    path.gsub!(/^app\//, "")
    ruby "bin/compile", path
  end
end

task "watch" do
  sh "babel", "-w", "-o", "dist/application.js", "src/application.js"
end

task "server" do
  ruby "-run", "-e", "httpd", "--", "-p", "3000", "public"
end
