'use client';

import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useCallback, useRef } from 'react';
import { files } from '@/utils/files';
import 'xterm/css/xterm.css';
import { debounce } from "lodash";

export default function Trainer() {
  const [codeElement, setCodeElement] = useState('');
  const [iframeUrl, setIframeUrl] = useState('loading.html');
  const [iframeId, setIframeId] = useState(0);
  const [containerInstance, setContainerInstance] = useState(null);
  const xtermRef = useRef(null);
  
  const request = debounce(value => {
    const updateInstance = async (value) => {
      await containerInstance.fs.writeFile('/index.js', value);
    }
    updateInstance(value);
  }, 300);
  const debouceRequest = useCallback(value => request(value), [request]);

  const updateCode = useCallback((newCode) => {
    debouceRequest(newCode?.target?.value);
    setCodeElement(newCode?.target?.value);
  }, [debouceRequest]);

  useEffect(() => {
    if(containerInstance === null) {
        const initTerminal = async () => await import('xterm');
        initTerminal().then(terminalObject => {
            const terminal = new terminalObject.Terminal();
            terminal?.open(xtermRef?.current);
            
            const loadContainer = async () => {
                setCodeElement(files['index.js'].file.contents);
                return WebContainer.boot();
            }
            
            loadContainer().then(async (container) => {
            await container.mount(files);
            
            const startDevServer = async (container) => {
                const serverProcess = await container.spawn('npm', [
                'run',
                'start',
                ]);
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
  }, [containerInstance]);

  return (
    <section>
      <div className="container">
        <div>
          <textarea onChange={updateCode} value={codeElement}></textarea>
        </div>
        <div>
          <iframe key={iframeId} src={iframeUrl}></iframe>
        </div>
       
      </div>
      <div className="terminal" ref={xtermRef}></div>
    </section>
  )
}
