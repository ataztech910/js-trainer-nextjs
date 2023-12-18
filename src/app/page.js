"use client";
import Trainer from '../components/Trainer';
import { contentful } from "@/utils/contentful";
import { useEffect, useState } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { renderOptions } from "@/utils/render-options";

export default function Home() {
  const [filesList, setFiles] = useState([]);
  const [contentData, setContent] = useState([]);

  useEffect(() => {
    contentful({ locale: 'en-US', 'fields.slug': 'what-is-aws-second', content_type: 'lesson'}).then(result => {
      const files = {};
      result.fields.files.forEach(file => {
        console.log(file);
        files[file.fields.name] = {
          file: {
            contents: file.fields.scriptBody
          }
        }
      });
      console.log(files);
      setFiles(files);
      setContent(result.fields.lessonText);
    });

  }, []);
  console.log('page loaded');
  return (
    <main>
      { Object.entries(filesList).length > 0 &&
        <Trainer
            parseStrategy={documentToReactComponents}
            contentData={contentData}
            filesData={filesList}
            themeProps={'dark'}
            renderOptions={renderOptions}
        />
      }
    </main>
  )
}
