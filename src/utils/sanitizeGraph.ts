export function stripNodeFields(nodes: any[]): any[] {
  return nodes.map((node) => {
    return {
      id: node.id,
      type: node.type,
      description: node.description,
      data: { label: node.data?.label, type: node.data?.type },
      position: node.position,
    };
  });
}

export function stripEdgeFields(edges: any[]): any[] {
  return edges.map((edge) => {
    const { position, selected, dragging, ...rest } = edge;
    return rest;
  });
}