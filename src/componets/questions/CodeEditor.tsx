import React from 'react'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/theme-crimson_editor'
import 'ace-builds/src-noconflict/mode-python' // 語言模式

import 'ace-builds/src-noconflict/ext-language_tools'

interface Props {
  code: string
  onCodeChange: (value: string) => void
  height?: string
  width?: string
}

const CodeEditor: React.FC<Props> = ({ code, onCodeChange, height, width }) => (
  <AceEditor
    mode="python"
    theme="crimson_editor"
    height={height}
    width={width}
    fontSize={24}
    value={code}
    onChange={onCodeChange}
    editorProps={{ $blockScrolling: true }}
  />
)

export default CodeEditor
