'use client';

import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useCallback, useRef } from 'react';
import 'xterm/css/xterm.css';
import { debounce } from "lodash";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import TrainerTools from "@/components/TrainerTools";
import Split from 'react-split';
import {pathToKey} from "@/utils/strings";

export default function Trainer({ themeProps, filesData, contentData, parseStrategy, renderOptions }) {
  const [codeElement, setCodeElement] = useState('');
  const [iframeUrl, setIframeUrl] = useState('loading.html');
  const [iframeId, setIframeId] = useState(0);
  const [containerInstance, setContainerInstance] = useState(null);
  const xtermRef = useRef(null);
  const [theme] = useState(themeProps);
  const [files] = useState(filesData);
  const [content] = useState(contentData);
  const registeredPlatforms = {
      'javascript': javascript,
      'html': html
  };

  const getMainFile = (path, filename) => {
      return path !== '.' ?
          pathToKey(path, filename, files.filesData) :
          files.filesData[files.mainFile]
  }

  const request = debounce(value => {
    const updateInstance = async (value) => {
      const pathToMainFile = files.pathToMainFile.replaceAll('/directory', '');
      await containerInstance.fs.writeFile(pathToMainFile + '/' + files.mainFile, value);
    }
    updateInstance(value);
  }, 600);
  const debounceRequest = useCallback(value => request(value), [request]);

  const updateCode = useCallback((newCode) => {
    debounceRequest(newCode);
    setCodeElement(newCode);
  }, [debounceRequest]);

  useEffect(() => {
    if(containerInstance === null) {
        console.log(files);
        const initTerminal = async () => await import('xterm');
        initTerminal().then(terminalObject => {
            const terminal = new terminalObject.Terminal();
            terminal?.open(xtermRef?.current);
            
            const loadContainer = async () => {
                const mainFile = getMainFile(files.pathToMainFile, files.mainFile, files.filesData);
                setCodeElement(mainFile.file.contents);
                return WebContainer.boot();
            }
            
            loadContainer().then(async (container) => {
            await container.mount(files.filesData);
            
            const startDevServer = async (container) => {
                const serverProcess = await container.spawn('npm', ['run', files.runCommand]);
                serverProcess.output.pipeTo(
                new WritableStream({
                    write(data) {
                        terminal?.write(data);
                    },
                })
                );
                container.on('server-ready', (port, url) => {
                setIframeUrl(url);
                setIframeId(Math.random() * 1000);
                });
            }
    
            const installDependencies = async () => {
                const installProcess = await container.spawn('npm', ['install']);
                installProcess.output.pipeTo(new WritableStream({
                write(data) {
                    terminal?.write(data);
                }
                }));
                return installProcess.exit;
            }
            
            installDependencies().then(() => {
                startDevServer(container);
                setContainerInstance(container);
            });
        });

        });
  }
  }, [containerInstance, files]);

  return (
    <section className="trainerSection">
        <Split
            sizes={[30,70]}
            gutterSize={7}
            className="split split-horizontal">
            <div className="trainerSection__content">
                {parseStrategy(content, renderOptions)}
            </div>
            <div>
                <Split
                    sizes={[60,40]}
                    gutterSize={7}
                    className="split split-horizontal">
                    <div>
                        <div className="ide-and-tools">
                            <TrainerTools></TrainerTools>
                            <CodeMirror
                                value={codeElement}
                                height="100%"
                                extensions={[registeredPlatforms[files.platform]()]}
                                onChange={updateCode}
                                theme={theme}
                            />
                        </div>
                    </div>
                    <div>
                        <Split
                            sizes={[80,20]}
                            direction="vertical"
                            gutterSize={6}
                            minSize={0}
                            className="split">
                            <div><iframe key={iframeId} src={iframeUrl}></iframe></div>
                            <div><div className="terminal" ref={xtermRef}></div></div>
                        </Split>
                    </div>
                </Split>
            </div>
        </Split>
    </section>
  )
}
