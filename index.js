const { ApolloServer, gql } = require("apollo-server");
const { generate } = require("shortid");

// Construct a schema, using GraphQL schema language
const typeDefs = `
  input TodosFilter {
    checked: Boolean
  }
  input Pagination {
    offset: Int!
    limit: Int! 
  }

  type Query {
    todos(filter: TodosFilter, offset: Int, limit: Int): [Todo!]!
    todosCount(filter: TodosFilter): Int!
		todo(id: String!): Todo!
  }

	type Todo {
		id: String!
		text: String!
    checked: Boolean!
    description: String
  }

	type Mutation {
		addTodo(text: String!, checked: Boolean!, description: String): Todo!
    updateTodo(id: String!, text: String!, checked: Boolean!, description: String): Todo!
    deleteTodo(id: String!): Todo
	}
`;

let todos = [{ id: generate(), text: "Do this", checked: false }];

// Add some initial todo items
Array(1000)
  .fill()
  .forEach((_, i) => {
    const todo = {
      id: generate(),
      text: "Todo item " + i,
      checked: i % 7 === 0
    };
    todos.push(todo);
  });

const DefaultPagination = {
  offset: 0,
  limit: 10
};

const filterTodos = (filter = {}) => {
  return todos.filter((todo) => {
    if (filter.checked !== null && typeof filter.checked !== "undefined") {
      return todo.checked === filter.checked;
    }
    return true;
  });
};

const applyPaginations = (todos, offset, limit) => {
  return todos.slice(offset, offset + limit);
};

const resolvers = {
  Query: {
    todos: (
      _,
      {
        filter = {},
        offset = DefaultPagination.offset,
        limit = DefaultPagination.limit
      }
    ) => {
      const filteredTodos = filterTodos(filter);
      return applyPaginations(filteredTodos, offset, limit);
    },
    todosCount: (_, { filter = {} }) => {
      return filterTodos(filter).length;
    },
    todo: (_, { id }) => {
      return todos.find((t) => t.id === id);
    }
  },
  Mutation: {
    addTodo: (_, { text, checked, description }) => {
      const id = generate();
      const todo = { id, text, checked, description };
      todos.unshift(todo);
      return todo;
    },
    updateTodo: (_, todo) => {
      todos = todos.map((t) => {
        if (t.id === todo.id) {
          return todo;
        } else {
          return t;
        }
      });
      return todo;
    },
    deleteTodo: (_, todo) => {
      const deletedTodo = todos.find((t) => t.id === todo.id);
      console.log("id", todo.id);
      console.log("todo", todo);
      todos = todos.filter((t) => t.id !== todo.id);
      return deletedTodo;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
