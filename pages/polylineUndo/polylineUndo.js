import Konva from "konva";
import { createMachine, createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';
import Stack from './stack';

class Command {
    execute() { };
    undo() { };
}

class SaveLineCommand extends Command {
    constructor(line, layer) {
        super();
        this.line = line;
        this.layer = layer;
    }
    execute() {
        this.layer.add(this.line);
    }
    undo() {
        this.line.remove();
    }
}


class UndoManager {
    constructor() {
        this.undoStack = new Stack();
        this.redoStack = new Stack();
    }

    executeCommand(command) {
        try {
            command.execute();
            this.undoStack.push(command);
            this.updateUndoRedoButtons();
        } catch (e) {
            console.log("could not execute" + e);
        }
    }

    canUndo() {
        return !this.undoStack.isEmpty();
    }

    canRedo() {
        return !this.redoStack.isEmpty();
    }

    undo() {
        if (this.canUndo()) {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        if (this.canRedo()) {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            this.updateUndoRedoButtons();        }
    }

    updateUndoRedoButtons() {
        undoButton.disabled = !this.canUndo();
        redoButton.disabled = !this.canRedo();   
    }
}

const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

const dessin = new Konva.Layer();
const temporaire = new Konva.Layer();
stage.add(dessin);
stage.add(temporaire);

const MAX_POINTS = 10;
let polyline // La polyline en cours de construction;

const polylineMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFkB5AVQGUBRAYWwEkWBpAbQAYAuohSpYuAC65U+YSAAeiAIwAWAGxEArAGYAHDo0AmA3x2qNqxRoA0ITEoCciosoDsRg-Zf6DWg4pcAvgE2aFh4hETSYAAKqATi1PTMbJy8grJoYpLSsgoIFvZEOpbKij5l9jou9jZ2CIqOzm4+Ospa1YZ8qkEhGDgExFGx8YmMTLQAakz8QkggmRJSMnN5rlpE9ho69j5aWpVtLta2SnxOBjpaDRcWygZqOj3zfeGDhMP4CUywAMYAhsgwDMMqJFjkVkpVAZnNt2mV9tVfFpaohfHwigYNG0NOZVEcdAYnqF+hEALZ-fCYD7iWCjZIcbjAuYLbLLUB5RR8FzrcxaZR8YwXFyuFEIAxeIgubmqPH2eyuExtIkvAZEcmU6m02hjFKMxSzERZJa5U6qHSadp85RYy6KKqirR45xaPhdUqKO1mZTKsKq9VUuKfLVJcY0KZMw1gtnyJRlDREGVQtyGLHWlyiznnW07Uwqe6BYLPX1kikB+K077-QER55G8HsxA6AWaLmeHFVLFQh2FKoGKHy-ZaDRlAu9YvEf2aihMT5gABONZZxohCB2PalRiHpj5JlFAFpOc4PUd2splJcXDLHoXia81aWpwAhP4-ADWsGQL6B6WZoNZJoQFxFHUNp2kuGVrTxZQHWMDEsSHXF8UJG8VRLDVAxpChnzfD8vx4fUQTraNVlUZQikqTo7XsLlqhg9ECXgnEZXxRQtCCQt8FQCA4BBcdCKjAC9zUI9pVUAUvDRZETgQPdPHIvhHC8M12guZCxxJYhSHIfj-xXJwtj7PZPD8WUzR0UU-DIzFTE8UoqmAvkfQ0yJ3gwnTlwbBBTyIfZzz4DRqIJPgrgslQiGs1RbLtIDVEclDx3vdDy3c+sY1XS5JQ0BT2li6zzOkyyE0RD1gv2Kp5XYgIgA */
        id: "polyLine",
        initial: "idle",
        states: {
            idle: {
            },
         },
    },
    {
        actions: {
            createLine: (context, event) => {
                const pos = stage.getPointerPosition();
                polyline = new Konva.Line({
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: "red",
                    strokeWidth: 2,
                });
                temporaire.add(polyline);
            },
            setLastPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;

                const newPoints = currentPoints.slice(0, size - 2); // Remove the last point
                polyline.points(newPoints.concat([pos.x, pos.y]));
                temporaire.batchDraw();
            },
            saveLine: (context, event) => {
                polyline.remove(); // On l'enlève de la couche temporaire
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                // Le dernier point(provisoire) ne fait pas partie de la polyline
                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints);
                polyline.stroke("black"); // On change la couleur
                //dessin.add(polyline); // On l'ajoute à la couche de dessin
                undoManager.executeCommand(new SaveLineCommand(polyline, dessin));
            },
            addPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const newPoints = [...currentPoints, pos.x, pos.y]; // Add the new point to the array
                polyline.points(newPoints); // Set the updated points to the line
                temporaire.batchDraw(); // Redraw the layer to reflect the changes
            },
            abandon: (context, event) => {
                polyline.remove();
            },
            removeLastPoint: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                const provisoire = currentPoints.slice(size - 2, size); // Le point provisoire
                const oldPoints = currentPoints.slice(0, size - 4); // On enlève le dernier point enregistré
                polyline.points(oldPoints.concat(provisoire)); // Set the updated points to the line
                temporaire.batchDraw(); // Redraw the layer to reflect the changes
            },
        },
        guards: {
            pasPlein: (context, event) => {
                // On peut encore ajouter un point
                return polyline.points().length < MAX_POINTS * 2;
            },
            plusDeDeuxPoints: (context, event) => {
                // Deux coordonnées pour chaque point, plus le point provisoire
                return polyline.points().length > 6;
            },
        },
    }
);

const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const undoManager = new UndoManager();

const actor = createActor(polylineMachine);
actor.start();

// On transmet les événements au statechart
stage.on("click", () => {
    actor.send({type: "MOUSECLICK"});
});

stage.on("mousemove", () => {
    actor.send({type: "MOUSEMOVE"});
});

window.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);
    actor.send({type: event.key});
});


undoButton.addEventListener("click", () => {
    undoManager.undo();
});

redoButton.addEventListener("click", () => {
    undoManager.redo();
});
