
import { Scenes, Context, Markup, Telegraf, Telegram } from 'npm:telegraf@4.12.2';
import mysql from "npm:mysql2@^2.3.3/promise";

async function init() {
  const connection = await mysql.createConnection({
    host: Deno.env.get('HOST'),
    user: Deno.env.get('USER'),
    password: Deno.env.get('PASSWORD'),
    database: Deno.env.get('DB'),
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS baby_actions (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      datetime DATETIME,
      user_id VARCHAR(255),
      actions VARCHAR(255),
      remarks VARCHAR(255)
    )
  `);
  console.log('MySql Adapter Pool generated successfully');
}

async function execute(query:any, values:any) {
  const connection = await mysql.createConnection({
    host: Deno.env.get('HOST'),
    user: Deno.env.get('USER'),
    password: Deno.env.get('PASSWORD'),
    database: Deno.env.get('DB'),
  });

  const [results, fields] = await connection.execute(query, values);

  await connection.end();

  return results;
}

init();

const execQuery = execute("SELECT * FROM baby_actions WHERE ID = ?", ["1"]);

execQuery
  .then((results) => {
    console.log(results); // log the query results
    // perform any necessary actions with the results here
  })
  .catch((error) => {
    console.error(error); // log the error
    // handle the error here
  });

const token = Deno.env.get('BOT_TOK') as string;

const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);

const str = Deno.env.get('whitelist');

const whiteListed = 

bot.start(async (ctx) => {
  if(ctx){
    console.log(ctx.from?.id);
    ctx.reply("Hello " + ctx.from.first_name + "! This is a bot to help track Jarius daily actions.");
    if(whiteListed.indexOf(ctx.from?.id)>=0){
      await menuKeyboard(ctx);
    }else{
      ctx.reply("Hello " + ctx.from.first_name + "! I am so sorry, you are not whitelisted.");
    }

  }
});

bot.action('Poop', async (ctx) => {
  // add in to save poop
  const dateNow = new Date();
  ctx.editMessageText('🎉 Awesome! Jarius just pooped 💩💩💩')
  ctx.reply('Jarius pooped at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  insertandRender(ctx,dateNow,"Poop","Jarius pooped");
  
})
bot.action('Bottle Feeding', async(ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('okey Jarius needs to drink some milk from the bottle')
  ctx.reply('Jarius drinks milk from bottle at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  insertandRender(ctx,dateNow,"Bottle Feeding","Jarius drinks milk from bottle.");
}
)
bot.action('Latch', async(ctx) => {
  // add in to save poop
const dateNow = new Date();
  ctx.editMessageText('👶 Jarius is latching 👄 ...');
  ctx.reply('Jarius is drawing milk from mama at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  insertandRender(ctx,dateNow,"Latch","Jarius drinks milk from mama");
})
bot.action('Pee', async (ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('yes Jarius is peeing 💦💦')
  ctx.reply('Jarius peed at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  insertandRender(ctx,dateNow,"Pee","Jarius xu xu");
})

bot.action('Sleep', async (ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('okie Jarius has slept good night 👶');
  ctx.reply('Jarius slept at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  insertandRender(ctx,dateNow,"Sleep","Jarius is in lala land.");
})

bot.action('Show20', async (ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('okie Jarius has done the following things at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  const selectQuery = execute("Select * from baby_actions order by datetime desc limit 20",[]);
  selectQuery
  .then((results) => {
    ctx.editMessageText("Here is a record of the last 20 things that Jarius did.");
    let stringbuilder:string = "";
   results.forEach(function(currentElement:any){    
      stringbuilder += 'Action: ' + currentElement.actions  + " Time: " + currentElement.datetime +  " Remarks: " + currentElement.remarks +"\n";
   })
    ctx.reply(stringbuilder); // log the query results
    // perform any necessary actions with the results here
    menuKeyboard(ctx);
  })
  .catch((error) => {
    console.error(error); // log the error
    // handle the error here
  });

})

bot.action('EndFeed', async (ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('okie Jarius has ate till his full');
  ctx.reply('Jarius eat finished at ' + dateNow.toLocaleDateString() +' '+ dateNow.toLocaleTimeString());
  insertandRender(ctx,dateNow,"EatFinish","Jarius is full. Burps.");

})


bot.action('Remarks', async (ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('under construction');
  menuKeyboard(ctx);
})

bot.action('ShowAll', async (ctx) => {
	const dateNow = new Date();
  ctx.editMessageText('under construction');
  ctx.editMessageText('under construction');
  menuKeyboard(ctx);

})

const menuKeyboard = async (ctx:any) => {
  return ctx.reply(
    'Please select the following action that Jarius needs to do now.',
    Markup.inlineKeyboard([
    [Markup.button.callback('Poop', 'Poop'),
    Markup.button.callback('Bottle Feeding', 'Bottle Feeding'),
    Markup.button.callback('Latch', 'Latch')],
    [Markup.button.callback('Pee', 'Pee'),
    Markup.button.callback('Sleep', 'Sleep'),
    Markup.button.callback('Show 20', 'Show20')],
    [Markup.button.callback('Finished Feeding', 'EndFeed'),
    Markup.button.callback('Show All', 'Show All')]
  ])
  );
}

const handlePoopCommand = (ctx:any) => {
    ctx.reply(
        'Jarius is pooping!'
      );
}

const insertandRender = (ctx:any, dateNow:Date,action:string, remarks:string) => {
  const number = execute("SELECT * FROM baby_tracker.baby_actions;",[]);
  let name:string | any= "";
  if(ctx){
    name = ctx.from?.first_name;
  }
  number.then((results) => {
    console.log(results); // log the query results
    const insertQuery = execute("INSERT INTO baby_actions VALUES (?,?, ?, ?,?)", [results.length +1, dateNow, name,action,remarks]);
    insertQuery
    .then((results) => {
      console.log(results); // log the query results
      // perform any necessary actions with the results here
      menuKeyboard(ctx);
    })
    .catch((error) => {
      console.error(error); // log the error
      // handle the error here
    });
  })
  .catch((error) => {
    console.error(error); // log the error
    // handle the error here
  });
}
function addHours(date:Date, hours:number) {
  date.setHours(date.getHours() + hours);

  return date;
}

bot.launch();

// Enable graceful stop
//process.once('SIGINT', () => bot.stop('SIGINT'));
//process.once('SIGTERM', () => bot.stop('SIGTERM'));
