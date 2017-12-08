task "compile" do
  rm_rf "docs"
  Dir.glob("app/**/*") do |path|
    next unless File.file?(path)
    path.gsub!(/^app\//, "")
    ruby "bin/compile", path
  end
end

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
