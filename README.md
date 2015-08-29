# node-red-contrib-sanitizer

JSON Sanitizer node has been created with the purpose of sanitizing the JSON content against mallicious scripts and system breakdowns

## Features

1. Can handle JSON as string and JSON as object as input. The user has the option to decide the type of output (string/object)
2. Different types of sanitizers such as password, length sanitizer and null sanitizer
3. Advanced sanitizer options to apply multiple rules on the input
4. Password sanitizer escape the password value to provide data privacy. Tested to work with nested JSONs also. Note: Privacy sanitizer expects properly parsed JSON content.
5. The sanitizer output is 100% safe for injection. 
6. Tested to work in Mozilla firefox/Chrome in UBUNTU 14.10 (Linux distro)

## Credits and feedback

1. This code is a part of the technical interview for HPC web student developer headed by Zeb
2. To develop this node, I have been going though exising nodes, especially Switch node.
3. The sanitizing logic is based on my understanding of JSON Sanitizing and may vary from your perspective. Correct me if wrong.
4. Beta testing is now open. Feel free to report bugs.
5. Please feel free to provide suggestions and impovements at abhijit5893@gmail.com.


