import sys
print("Python executable:", sys.executable)
print("Python path:", sys.path)
try:
    import flask
    print("Flask version:", flask.__version__)
    print("Flask location:", flask.__file__)
except ImportError as e:
    print("Error importing Flask:", str(e)) 