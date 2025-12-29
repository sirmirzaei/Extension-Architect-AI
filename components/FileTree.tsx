
import React from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';

interface FileTreeProps {
  files: Record<string, string>;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

export const FileTree: React.FC<FileTreeProps> = ({ files, selectedPath, onSelect }) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set(['root']));

  const buildTree = (filePaths: string[]): TreeNode[] => {
    const root: TreeNode[] = [];
    filePaths.forEach(path => {
      const parts = path.split('/');
      let currentLevel = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = index === parts.length - 1;
        let existingNode = currentLevel.find(node => node.name === part);

        if (!existingNode) {
          existingNode = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : []
          };
          currentLevel.push(existingNode);
        }
        if (!isLast && existingNode.children) {
          currentLevel = existingNode.children;
        }
      });
    });

    // Sort: Folders first, then alphabetically
    const sortTree = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => node.children && sortTree(node.children));
    };
    sortTree(root);
    return root;
  };

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const tree = React.useMemo(() => buildTree(Object.keys(files)), [files]);

  const renderNode = (node: TreeNode, depth: number) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedPath === node.path;

    return (
      <div key={node.path}>
        <div
          onClick={() => node.type === 'file' ? onSelect(node.path) : null}
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-slate-800 transition-colors group ${isSelected ? 'bg-indigo-600/30 text-indigo-300' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.type === 'folder' && (
            <div onClick={(e) => toggleFolder(node.path, e)} className="p-0.5 hover:bg-slate-700 rounded transition-colors">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
          {node.type === 'file' ? (
            <File size={14} className="text-slate-400" />
          ) : (
            <Folder size={14} className="text-indigo-400 fill-indigo-400/20" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === 'folder' && isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="py-2 overflow-y-auto h-full">
      {tree.map(node => renderNode(node, 0))}
    </div>
  );
};
