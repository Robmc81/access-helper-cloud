
export const convertToXML = (obj: any): string => {
  const createNode = (key: string, value: any): string => {
    if (value === null || value === undefined) {
      return `<${key}></${key}>`;
    }
    
    if (Array.isArray(value)) {
      return `<${key}>${value.map(item => {
        if (typeof item === 'object') {
          return Object.entries(item).map(([k, v]) => createNode(k, v)).join('');
        }
        return `<item>${item}</item>`;
      }).join('')}</${key}>`;
    }
    
    if (typeof value === 'object') {
      return `<${key}>${Object.entries(value).map(([k, v]) => createNode(k, v)).join('')}</${key}>`;
    }
    
    return `<${key}>${value}</${key}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${Object.entries(obj).map(([key, value]) => 
    createNode(key, value)).join('')}</root>`;
};

export const parseXML = (xmlString: string): any => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const parseNode = (node: Element): any => {
    if (node.children.length === 0) {
      return node.textContent;
    }

    if (Array.from(node.children).every(child => child.tagName === 'item')) {
      return Array.from(node.children).map(item => item.textContent);
    }

    const result: any = {};
    Array.from(node.children).forEach(child => {
      result[child.tagName] = parseNode(child);
    });
    return result;
  };

  const root = xmlDoc.documentElement;
  return parseNode(root);
};
