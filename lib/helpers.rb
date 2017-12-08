Haml::Helpers.module_eval do
  def include_file(path)
    File.read(File.join(__dir__, "..", path))
  end
end
