'use client'

import clsx from 'clsx'

import MonacoEditor from '@monaco-editor/react'
import * as monaco from 'monaco-editor';
import { monacoOptions } from './config'
//import { monaco } from 'react-monaco-editor'
import { useEffect, useRef, useState } from 'react'
import { Loader } from 'shared'
import { LessonView } from 'types'
import { useLessonContext } from 'ui'
import { useMediaQuery } from 'hooks'
// @ts-ignore
import { constrainedEditor } from 'constrained-editor-plugin'

export default function Editor({
  language,
  value,
  onChange,
  onValidate,
  code,
  constraints,
  hiddenRange,
}: {
  language: string
  value?: string
  onChange?: (value: string) => void
  onValidate?: (value: monaco.editor.IMarker[]) => void
  code?: string
  constraints: any
  hiddenRange?: number[]
}) {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  const { activeView } = useLessonContext()
  const isActive = activeView === LessonView.Code
  const [loading, setLoading] = useState<boolean>(true)
  const [options, setOptions] = useState(monacoOptions)
  const monacoRef = useRef<any>()
  
  const createMonacoOptions = (range) => {
    return {
      ...monacoOptions,
      lineNumbers: (lineNumber: number) => (lineNumber - range).toString(),
    }
  }
   function convertLinksToDecorations(model: monaco.editor.ITextModel): monaco.editor.IModelDeltaDecoration[] {
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const lines = model.getLinesContent();

    lines.forEach((line, lineNumber) => {
        let match;
        while ((match = linkPattern.exec(line)) !== null) {
            decorations.push({
                range: new monaco.Range(lineNumber + 1, match.index + 1, lineNumber + 1, match.index + 1 + match[0].length),
                options: {
                    inlineClassName: 'link-style',
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            });
        }
    });

    return decorations;
}

function handleLinkClick(e, editor) {
    if (e.target.position) {
        const { lineNumber, column } = e.target.position;
        const model = editor.getModel();
        const lineContent = model.getLineContent(lineNumber);
        const linkPattern = /(https?:\/\/[^\s]+)/;
        const match = linkPattern.exec(lineContent);

        if (match && column >= match.index + 1 && column <= match.index + 1 + match[0].length) {
            window.open(match[0], '_blank');
        }
    }
}

  const handleBeforeMount = (monaco) => {
    hiddenRange && setOptions(createMonacoOptions(hiddenRange[2]))
    monaco.editor.defineTheme('satoshi', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBorder': '#00000000', // 4th channel is for transparency
      },
    })
  }

  const handleMount = (editor, monaco) => {
    hiddenRange &&
      editor.setHiddenAreas([
        new monaco.Range(
          hiddenRange[0],
          hiddenRange[1],
          hiddenRange[2],
          hiddenRange[3]
        ),
      ])
    monaco.editor.setTheme('satoshi')
    setLoading(false)

    monacoRef.current = { monaco, editor }

    const model = editor.getModel()
    const constrainedInstance = constrainedEditor(monaco)
    constrainedInstance.initializeIn(editor)
    constrainedInstance.addRestrictionsTo(model, constraints)
    // Handle link clicks
    editor.onMouseDown(e => {
      if (e.target.position) {
          const { lineNumber, column } = e.target.position;
          const lineContent = editor.getModel().getLineContent(lineNumber);
          const linkPattern = /(https?:\/\/[^\s]+)/g;
          let match;
          while ((match = linkPattern.exec(lineContent)) !== null) {
              if (column >= match.index + 1 && column <= match.index + 1 + match[0].length) {
                  window.open(match[0], '_blank');
              }
          }
      }
  });
  }

  const isSmallScreen = useMediaQuery({ width: 767 })
  const headerHeight = isSmallScreen ? 63 : 70
  const languageTabsHeight = 40
  const statusBarHeight = 56
  const terminalHeight = 218
  const terminalTabsHeight = 40
  const mobileMenuHeight = 48

  const totalHeight = isSmallScreen
    ? headerHeight + mobileMenuHeight + languageTabsHeight + statusBarHeight
    : headerHeight +
      languageTabsHeight +
      statusBarHeight +
      terminalHeight +
      terminalTabsHeight

  useEffect(() => {
    hiddenRange && setOptions(createMonacoOptions(hiddenRange[2]))
    if (monacoRef.current) {
      const { editor, monaco } = monacoRef.current
      const model = monaco.editor.createModel(value, language)

      editor.setModel(model)
      hiddenRange &&
        editor.setHiddenAreas([
          new monaco.Range(
            hiddenRange[0],
            hiddenRange[1],
            hiddenRange[2],
            hiddenRange[3]
          ),
        ])
      const constrainedInstance = constrainedEditor(monaco)
      constrainedInstance.initializeIn(editor)
      constrainedInstance.addRestrictionsTo(model, constraints)
    }
  }, [language])

  return (
    <div
      className={clsx('relative grow font-mono text-sm text-white', {
        'hidden md:flex': !isActive,
        flex: isActive,
      })}
    >
      <MonacoEditor
        loading={<Loader className="h-10 w-10 text-white" />}
        width={isSmallScreen ? '100vw' : 'calc(100vw / 2)'}
        height={`calc(var(--dynamic-height) - ${totalHeight}px)`}
        language={language}
        theme={'satoshi'}
        value={value}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={onChange}
        onValidate={onValidate}
        options={options}
      />
    </div>
  )
}
