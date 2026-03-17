// Keyboard shortcuts help panel component

interface KeyboardShortcutsHelpProps {
  role?: 'student' | 'teacher' | 'admin';
}

export function KeyboardShortcutsHelp({ role = 'student' }: KeyboardShortcutsHelpProps) {
  const shortcuts = {
    student: [
      { keys: ['G', 'H'], description: 'Go to Home' },
      { keys: ['G', 'S'], description: 'Go to Sessions' },
      { keys: ['G', 'P'], description: 'Go to Profile' },
      { keys: ['G', 'V'], description: 'Go to Vocabulary' },
      { keys: ['G', 'T'], description: 'Go to Tests' },
      { keys: ['Ctrl', 'K'], description: 'Search' },
      { keys: ['?'], description: 'Show shortcuts' },
      { keys: ['Esc'], description: 'Close modal' },
    ],
    teacher: [
      { keys: ['T', 'D'], description: 'Go to Dashboard' },
      { keys: ['T', 'S'], description: 'Go to Students' },
      { keys: ['T', 'C'], description: 'Go to Classes' },
      { keys: ['T', 'L'], description: 'Go to Content Library' },
      { keys: ['T', 'G'], description: 'Go to Grading Center' },
      { keys: ['Ctrl', 'K'], description: 'Search' },
    ],
    admin: [
      { keys: ['Ctrl+A', 'D'], description: 'Go to Dashboard' },
      { keys: ['Ctrl+A', 'U'], description: 'Go to Users' },
      { keys: ['Ctrl+A', 'C'], description: 'Go to Content' },
      { keys: ['Ctrl+A', 'A'], description: 'Go to Analytics' },
      { keys: ['Ctrl', 'K'], description: 'Search' },
    ]
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
      <div className="grid gap-2">
        {shortcuts[role].map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, i) => (
                <kbd
                  key={i}
                  className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
