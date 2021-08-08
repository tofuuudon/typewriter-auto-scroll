/**
 * @file The main file that runs the extension.
 * @author Mikey Lau
 * {@link https//mikeylau.uk|Portfolio}
 * {@link https://github.com/MikeyJL|Github}
 * @version 1.0
 */

const vscode = require('vscode')

/**
 * Runs once when the extension is activated.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
function activate (context) {
  const config = vscode.workspace.getConfiguration('typewriterAutoScroll')
  const enable = config.get('enable')
  const offset = config.get('offset')
  context.subscriptions.push(new TypewriterAutoScroll(enable, offset))
}

/**
 * Runs once when the extension is deactivated.
 */
function deactivate () {}

/**
 * @class Typewriter controller.
 */
class TypewriterAutoScroll {
  /**
   * The state of the typewriter extension.
   * @param {boolean} enable - Whether the extension is enabled.
   */
  constructor (enable, offset) {
    this.enable = enable
    this.offset = offset
    if (!this.statusBar) {
      this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    }

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      this.statusBar.hide()
    } else {
      if (enable) {
        this.statusBar.text = 'Typewriter ON'
      } else {
        this.statusBar.text = 'Typewriter OFF'
      }
      this.statusBar.show()
    }

    const subscriptions = []
    vscode.commands.registerCommand('toggleTypewriter', () => {
      this.toggleEnable()
    })
    vscode.commands.registerCommand('changeTypewriterOffset', () => {
      this.changeOffset()
    })
    vscode.workspace.onDidChangeConfiguration(this.onConfigurationChange, this, subscriptions)
    vscode.window.onDidChangeTextEditorSelection(this.onSelectionChange, this, subscriptions)
  }

  /**
   * Toggles the state of the typewriter auto-scroll.
   */
  toggleEnable () {
    this.enable = !this.enable

    const configuration = vscode.workspace.getConfiguration('typewriterAutoScroll')
    configuration.update('enable', this.enable)
    if (this.enable) {
      vscode.window.showInformationMessage('Typewriter: toggled on!')
      this.statusBar.text = 'Typewriter ON'
    } else {
      vscode.window.showInformationMessage('Typewriter: toggled off!')
      this.statusBar.text = 'Typewriter OFF'
    }
    this.statusBar.show()
  }

  async changeOffset () {
    const newOffset = await vscode.window.showInputBox({
      title: 'Specify a new offset from the centered/focused line'
    })
    if (newOffset) {
      this.offset = parseInt(newOffset)
      const configuration = vscode.workspace.getConfiguration('typewriterAutoScroll')
      configuration.update('offset', parseInt(newOffset))
      vscode.window.showInformationMessage(`Typewriter: changed offset to ${newOffset}`)
    }
  }

  /**
   * Centers the viewport onto the focused line when typewriter auto-scroll is enabled.
   */
  onSelectionChange (instance) {
    if (this.enable && instance.kind !== 2) {
      const editor = vscode.window.activeTextEditor
      const selection = editor.selection
      const centerScrollPosition = new vscode.Position(selection.active.line + this.offset, 0)
      const range = new vscode.Range(centerScrollPosition, centerScrollPosition)
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
    }
  }

  /**
   * Updates the status and enabled state from the extension settings.
   */
  onConfigurationChange () {
    const configuration = vscode.workspace.getConfiguration('typewriterAutoScroll')
    if (configuration.get('enable')) {
      this.enable = true
      this.statusBar.text = 'Typewriter ON'
    } else {
      this.enable = false
      this.statusBar.text = 'Typewriter OFF'
    }
    this.statusBar.show()
  }
}

module.exports = {
  activate,
  deactivate
}
