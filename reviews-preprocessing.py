import pandas as pd

df = pd.read_csv("KFC-Nguyen-Van-Thoai.csv")
df.head()
df = df.drop_duplicates()
df = df.dropna()
df = df[~df['Review'].str.contains("KFC xin cảm ơn", na=False)]
df = df[~df['Review'].str.contains("KFC cảm ơn bạn", na=False)]
df = df[~df['Review'].str.contains("https://go.momos.com/KFC", na=False)]


def determine_sentiment(rating):
    if '4 stars' in rating or '5 stars' in rating:
        return 'positive'
    elif '1 star' in rating or '2 stars' in rating or '3 stars' in rating:
        return 'negative'
    else:
        return 'unknown'  # In case there are any ratings that don't match expected values

# Apply the function to the 'Rating' column
df['Sentiment'] = df['Rating'].apply(determine_sentiment)

# Display the updated dataframe
df.to_csv("KFC-Nguyen-Van-Thoai.csv", index=False)
