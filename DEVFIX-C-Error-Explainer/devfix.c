/*
 * DEVFIX - C Error Explainer
 * A simple C-language version of the idea shown in the challenge.
 *
 * Compile:
 *   gcc devfix.c -o devfix
 *
 * Run:
 *   ./devfix
 * On Windows:
 *   devfix.exe
 */

#include <stdio.h>
#include <string.h>
#include <ctype.h>

void lower_text(char *text) {
    for (int i = 0; text[i] != '\0'; i++) {
        text[i] = (char)tolower((unsigned char)text[i]);
    }
}

void show_result(const char *topic) {
    if (strstr(topic, "scanf") != NULL) {
        printf("\nWHAT HAPPENED?\n");
        printf("scanf() normally needs the address of a variable.\n");

        printf("\nPOSSIBLE CAUSE\n");
        printf("You may have written scanf(\"%%d\", x) instead of scanf(\"%%d\", &x).\n");

        printf("\nSUGGESTED SOLUTION\n");
        printf("int x;\nscanf(\"%%d\", &x);\n");
    }
    else if (strstr(topic, "semicolon") != NULL ||
             strstr(topic, "expected") != NULL) {
        printf("\nWHAT HAPPENED?\n");
        printf("The compiler expected a statement to end correctly.\n");

        printf("\nPOSSIBLE CAUSE\n");
        printf("A semicolon may be missing.\n");

        printf("\nSUGGESTED SOLUTION\n");
        printf("int x = 10;\nprintf(\"Hello\");\n");
    }
    else if (strstr(topic, "printf") != NULL ||
             strstr(topic, "format") != NULL) {
        printf("\nWHAT HAPPENED?\n");
        printf("The printf format may not match the value type.\n");

        printf("\nSUGGESTED SOLUTION\n");
        printf("int age = 18;\nprintf(\"%%d\", age);\n");
    }
    else if (strstr(topic, "undeclared") != NULL ||
             strstr(topic, "not declared") != NULL) {
        printf("\nWHAT HAPPENED?\n");
        printf("A name was used before it was declared.\n");

        printf("\nSUGGESTED SOLUTION\n");
        printf("int number;\nnumber = 10;\n");
    }
    else {
        printf("\nDEVFIX could not identify this error yet.\n");
        printf("Check the compiler message and the line number.\n");
        printf("Then inspect the surrounding lines for syntax or type mistakes.\n");
    }
}

int main(void) {
    char error[500];

    printf("====================================\n");
    printf("        DEVFIX - C ERROR HELPER\n");
    printf("====================================\n");
    printf("Turn C coding errors into understandable solutions.\n\n");

    printf("Enter your C error:\n> ");
    fgets(error, sizeof(error), stdin);

    lower_text(error);
    show_result(error);

    printf("\n====================================\n");
    printf("Keep learning. Every compiler error is a clue!\n");
    printf("====================================\n");

    return 0;
}
