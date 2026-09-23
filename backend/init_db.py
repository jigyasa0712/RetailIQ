import os
import kagglehub
from kagglehub import KaggleDatasetAdapter
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def run():
    print("Downloading/Loading dataset from Kaggle...")
    # Load just a subset for development speed. Remove nrows to load the full 1,000,000 rows.
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "utkalk/large-retail-data-set-for-eda",
        "retail_data.csv",
        pandas_kwargs={"encoding": "ISO-8859-1", "compression": "zip", "nrows": 5000}
    )
    
    print(f"Dataset loaded. Shape: {df.shape}")
    
    print("Inserting into PostgreSQL table 'retail_transactions'...")
    df.to_sql('retail_transactions', engine, if_exists='replace', index=False, chunksize=500)
    print("Data ingestion complete!")

if __name__ == "__main__":
    run()
