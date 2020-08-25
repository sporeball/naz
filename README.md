# naz
**naz** is a JavaScript-based esolang where every command is named by a number and a letter.

### usage

#### node
first, clone this repository, and install its dependencies:

```
$ npm install
```

you can then run any naz program like so:

```
$ node naz.js filename.naz
```

#### online
you can also experiment with naz using the **beta** [web-based interpreter](https://sporeball.dev/naz)! this is a lot more unstable compared to the original Node-based implementation, but should work if you're in a hurry!

### command reference
- `0-9` - number literal. exactly **one** of these **must** be placed before every instruction.
- `a` - adds *n* to the register.
- `d` - divides the register by *n*, rounding down.
- `e` - conditional equal to. executes a function if the value in the register is *equal to* the value of variable *n*.
- `f` - function command:
  - opcode 0 - *executes* function *n*.
  - opcode 1 - *declares* function *n*.
- `g` - conditional greater than. executes a function if the value in the register is *greater than* the value of variable *n*.
- `h` - halts program execution. **this is meant to be used for debugging purposes only.**
- `l` - conditional less than. executes a function if the value in the register is *less than* the value of variable *n*.
- `m` - multiplies the register by *n*.
- `n` - negates variable *n*.
- `o` - outputs a value determined by the value in the register:
  - 0-9 - outputs that number.
  - 10 - outputs a newline.
  - 32-126 - outputs an ASCII value.
- `p` - divides the register by *n*, then sets the register equal to the remainder.
- `r` - sets the register equal to the ASCII value of the *n*-th character of the input string, then removes that character from the input.
- `s` - subtracts *n* from the register.
- `v` - variable command:
  - opcode 0 - sets the register equal to the value of variable *n*.
  - opcode 2 - sets variable *n* equal to the value in the register.
- `x` - sets the current opcode to *n*.

### opcodes
- `0` - normal operation. commands will execute one at a time, in order.
- `1` - function write. commands will become part of the function referenced through use of the `f` command until a newline is parsed.
- `2` - variable write. only the `v` command will be accepted, after which the interpreter will return to opcode 0.
- `3` - conditional opcode. the interpreter **must** parse a call to the `v` command, followed by a call to a conditional instruction (`l`, `e` or `g`). afterwards, the interpreter will return to opcode 0.

### command line flags
- `-u` / `--unlimited` - whether to remove the default limits on integer values (default: false)
- `-d` / `--delay` - sets the delay between execution steps (default: 1ms) (optional)
- `-i` / `--input` - sets the string to use as input, to be read by the `r` command (default: none) (optional)
- `-f` / `--file` - sets the file whose contents will be read by the `r` command. this takes precedence over the `-i` flag (default: none) (optional)

#### notes
- by default, the value in the register must always be between -127 and 127 inclusive, or program execution will **immediately halt**. this behavior can be disabled with the `-u` flag.
- conditional instructions can only be run in opcode 3.

### example
the following naz program will add 9 to the register, multiply by 7, and add 2 (resulting in a value of 65), then output once, resulting in a final output of `A`:

```
9a7m2a1o
```

for more complicated examples, check the [examples folder](https://github.com/sporeball/naz/tree/master/examples).

### computational class
naz is at least as powerful as a finite state automaton, because it can implement the esolang [dd](https://esolangs.org/wiki/Dd). given some input file, the example program [dd.naz](https://github.com/sporeball/naz/blob/master/examples/dd.naz) will follow the dd specification and stop reading input when it encounters the control character STX (U+0002).

### thanks
the naz interpreter and runner are heavily based on those of the fantastic [\\/\\/>](https://github.com/torcado194/worm), by [torcado](https://github.com/torcado194). <3

### donate
you can support the development of this project and others via Patreon:

<a href="https://patreon.com/sporeball"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsporeball%2Fpledgesssss&style=for-the-badge" /></a>
