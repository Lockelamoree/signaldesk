const LIMITS = {
  messageBlocks: 50,
  blockId: 255,
  sectionText: 3000,
  sectionFields: 10,
  sectionFieldText: 2000,
  actionElements: 25,
  buttonText: 75,
  buttonActionId: 255,
  buttonValue: 2000
};

function textLength(textObject) {
  return typeof textObject?.text === "string" ? textObject.text.length : 0;
}

function addLengthError(errors, path, value, max) {
  if (typeof value === "string" && value.length > max) {
    errors.push(`${path} is ${value.length} characters; max ${max}`);
  }
}

function validateButton(errors, element, path) {
  if (element.type !== "button") return;

  if (!element.text?.text) {
    errors.push(`${path}.text.text is required for button elements`);
  }
  addLengthError(errors, `${path}.text.text`, element.text?.text, LIMITS.buttonText);
  addLengthError(errors, `${path}.action_id`, element.action_id, LIMITS.buttonActionId);
  addLengthError(errors, `${path}.value`, element.value, LIMITS.buttonValue);
}

function validateElements(errors, elements, path) {
  if (!Array.isArray(elements)) {
    errors.push(`${path} must be an array`);
    return;
  }

  elements.forEach((element, index) => {
    validateButton(errors, element, `${path}[${index}]`);
  });
}

function validateSection(errors, block, path) {
  if (!block.text && !block.fields) {
    errors.push(`${path} must include text or fields`);
  }

  if (block.text) {
    if (!block.text.text) errors.push(`${path}.text.text is required`);
    addLengthError(errors, `${path}.text.text`, block.text.text, LIMITS.sectionText);
  }

  if (block.fields) {
    if (!Array.isArray(block.fields)) {
      errors.push(`${path}.fields must be an array`);
    } else {
      if (block.fields.length > LIMITS.sectionFields) {
        errors.push(`${path}.fields has ${block.fields.length} items; max ${LIMITS.sectionFields}`);
      }
      block.fields.forEach((field, index) => {
        if (!field.text) errors.push(`${path}.fields[${index}].text is required`);
        addLengthError(errors, `${path}.fields[${index}].text`, field.text, LIMITS.sectionFieldText);
      });
    }
  }
}

function validateActions(errors, block, path) {
  if (!Array.isArray(block.elements) || !block.elements.length) {
    errors.push(`${path}.elements must contain at least one interactive element`);
    return;
  }
  if (block.elements.length > LIMITS.actionElements) {
    errors.push(`${path}.elements has ${block.elements.length} items; max ${LIMITS.actionElements}`);
  }
  validateElements(errors, block.elements, `${path}.elements`);
}

function validateBlock(errors, block, index) {
  const path = `blocks[${index}]`;

  if (!block?.type) {
    errors.push(`${path}.type is required`);
    return;
  }

  addLengthError(errors, `${path}.block_id`, block.block_id, LIMITS.blockId);

  if (block.type === "section") validateSection(errors, block, path);
  if (block.type === "actions") validateActions(errors, block, path);
  if (block.type === "context") validateElements(errors, block.elements ?? [], `${path}.elements`);
  if (block.accessory) validateButton(errors, block.accessory, `${path}.accessory`);
}

export function validateSlackBlocks(blocks) {
  const errors = [];

  if (!Array.isArray(blocks)) {
    return {
      valid: false,
      errors: ["blocks must be an array"],
      summary: {
        blocks: 0,
        actionsBlocks: 0,
        interactiveElements: 0
      }
    };
  }

  if (blocks.length > LIMITS.messageBlocks) {
    errors.push(`blocks has ${blocks.length} items; max ${LIMITS.messageBlocks}`);
  }

  blocks.forEach((block, index) => validateBlock(errors, block, index));

  const actionsBlocks = blocks.filter((block) => block.type === "actions").length;
  const interactiveElements = blocks
    .filter((block) => block.type === "actions")
    .reduce((total, block) => total + (Array.isArray(block.elements) ? block.elements.length : 0), 0);

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      blocks: blocks.length,
      actionsBlocks,
      interactiveElements
    }
  };
}

export function assertSlackBlocksValid(blocks) {
  const result = validateSlackBlocks(blocks);
  if (!result.valid) {
    throw new Error(`Slack Block Kit validation failed: ${result.errors.join("; ")}`);
  }
  return result;
}
