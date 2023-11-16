import Editor, { EditorProps, OnMount } from '@monaco-editor/react'
import { merge, noop } from 'lodash'
import { useRef } from 'react'
import { format } from 'sql-formatter'
import { cn } from 'ui'

export const CodeEditor = ({
  className,
  content = '',
}: {
  className?: string
  content: string
}) => {
  const code = format(content, { language: 'postgresql' })

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Editor2 id="sql-editor" language="pgsql" value={code} className="h-full" />
    </div>
  )
}

interface CodeEditorProps {
  id: string
  language: 'pgsql' | 'json' | 'html'
  autofocus?: boolean
  defaultValue?: string
  isReadOnly?: boolean
  onInputChange?: (value?: string) => void
  onInputRun?: (value: string) => void
  hideLineNumbers?: boolean
  className?: string
  loading?: boolean
  options?: EditorProps['options']
  value?: string
}
const Editor2 = ({
  id,
  language,
  defaultValue,
  autofocus = true,
  hideLineNumbers = false,
  onInputChange = noop,
  className,
  options,
  value,
}: CodeEditorProps) => {
  const editorRef = useRef()

  const onMount: OnMount = async (editor) => {
    // Add margin above first line
    editor.changeViewZones((accessor) => {
      accessor.addZone({
        afterLineNumber: 0,
        heightInPx: 4,
        domNode: document.createElement('div'),
      })
    })

    // await timeout(500)
    if (autofocus) editor?.focus()
  }

  const optionsMerged = merge(
    {
      tabSize: 2,
      fontSize: 13,
      readOnly: true,
      minimap: { enabled: false },
      wordWrap: 'on',
      fixedOverflowWidgets: true,
      contextmenu: true,
      lineNumbers: hideLineNumbers ? 'off' : undefined,
      glyphMargin: hideLineNumbers ? false : undefined,
      lineNumbersMinChars: hideLineNumbers ? 0 : undefined,
      folding: hideLineNumbers ? false : undefined,
    },
    options
  )

  merge({ cpp: '12' }, { java: '23' }, { python: '35' })

  return (
    <Editor
      path={id}
      theme="supabase"
      className={cn(className, 'monaco-editor')}
      value={value ?? undefined}
      defaultLanguage={language}
      defaultValue={defaultValue ?? undefined}
      loading={false}
      options={optionsMerged}
      onMount={onMount}
      onChange={onInputChange}
    />
  )
}