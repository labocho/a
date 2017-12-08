task "compile" do
  sh "babel", "-o", "dist/application.js", "src/application.js"
  sh "haml -r ./lib/helpers.rb src/index.haml > index.html"
end

task "watch" do
  sh "babel", "-w", "-o", "dist/application.js", "src/application.js"
end
