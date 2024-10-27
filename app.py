from flask import Flask, request
import io
import sys

app = Flask(__name__)

# HTML template for the webpage
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Code Compiler</title>
</head>
<body>
    <h1>Python Code Compiler</h1>
    <form method="POST" action="/compile">
        <textarea name="code" rows="10" cols="50" placeholder="Write your Python code here...">{{ code }}</textarea><br>
        <input type="submit" value="Run Code">
    </form>
    <h2>Output:</h2>
    <pre id="output">{{ output }}</pre>
</body>
</html>
"""

@app.route('/', methods=['GET'])
def index():
    return HTML_TEMPLATE.replace('{{ code }}', '').replace('{{ output }}', '')

@app.route('/compile', methods=['POST'])
def compile_code():
    code = request.form['code']
    output = ""

    # Redirect stdout to capture print output
    old_stdout = sys.stdout
    redirected_output = io.StringIO()
    sys.stdout = redirected_output

    try:
        # Execute the submitted code
        exec_globals = {}
        exec_locals = {}
        exec(code, exec_globals, exec_locals)

        # Get the output from stdout
        output = redirected_output.getvalue() or "Code executed successfully."
    except Exception as e:
        output = f"Error: {str(e)}"
    finally:
        # Reset stdout
        sys.stdout = old_stdout

    return HTML_TEMPLATE.replace('{{ code }}', code).replace('{{ output }}', output)

if __name__ == '__main__':
    app.run(debug=True)
