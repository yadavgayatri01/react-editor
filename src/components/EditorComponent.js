import React, { useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Button from "./Button";
import Title from "./Title";

function EditorComponent() {
  // Load editor state from localStorage
  const loadEditorState = () => {
    const savedData = localStorage.getItem("editorContent");
    try {
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (
          parsedData &&
          parsedData.blocks &&
          parsedData.entityMap !== undefined
        ) {
          return EditorState.createWithContent(convertFromRaw(parsedData));
        }
      }
    } catch (error) {
      console.error("Error loading editor content:", error);
    }
    return EditorState.createEmpty();
  };

  const [editorState, setEditorState] = useState(loadEditorState);

  // Handle key commands like bold, heading etc.
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Custom method to detect `#`, `*`, `**`, and `***` and apply block formatting
  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const blockText = currentContent.getBlockForKey(blockKey).getText();

    // Handle "#" for heading
    if (blockText === "#" && chars === " ") {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-block-type"
      );
      setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
      return "handled";
    }

    // Handle "***" for underline block formatting
    if (blockText.startsWith("***") && chars === " ") {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3, // Correct offset for 3 asterisks
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-block-type"
      );
      setEditorState(
        RichUtils.toggleBlockType(newEditorState, "underline-block")
      ); // Apply underline block formatting
      return "handled";
    }

    // Handle "**" for red line block formatting
    if (blockText.startsWith("**") && chars === " ") {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2, // Skip past the `**`
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-block-type"
      );
      setEditorState(
        RichUtils.toggleBlockType(newEditorState, "red-line-block")
      ); // Apply red line block
      return "handled";
    }
    // Handle "*" for bold (as block)
    if (blockText === "*" && chars === " ") {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-block-type"
      );
      setEditorState(RichUtils.toggleBlockType(newEditorState, "blockquote")); // Make it a block with bold-like formatting
      return "handled";
    }
    return "not-handled";
  };

  // Handle the Enter key to reset formatting for the new line
  const handleReturn = (e) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // Split the block to create a new line
    const newContentState = Modifier.splitBlock(contentState, selection);
    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "split-block"
    );

    // Move the selection to the new line (after the split)
    const newSelection = newEditorState.getSelection();

    // Reset block type to unstyled for the new line
    newEditorState = RichUtils.toggleBlockType(newEditorState, "unstyled");

    // Force the selection to the new line to apply changes
    setEditorState(EditorState.forceSelection(newEditorState, newSelection));
    return "handled";
  };

  // Save content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContent));
    alert("Content saved!");
  };

  // Function to handle block style toggle
  const blockStyleFn = (block) => {
    const type = block.getType();
    if (type === "header-one") {
      return "heading";
    } else if (type === "blockquote") {
      return "bold-block";
    } else if (type === "red-line-block") {
      return "red-line-block";
    } else if (type === "underline-block") {
      return "underline-block";
    }
    return null;
  };

  return (
    <>
      <div class="header-container">
        <Title />
        <Button saveContent={saveContent} />
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          blockStyleFn={blockStyleFn}
          handleBeforeInput={handleBeforeInput}
          handleReturn={handleReturn}
          placeholder="Start typing..."
        />
      </div>
    </>
  );
}

export default EditorComponent;
